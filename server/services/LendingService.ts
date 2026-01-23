import { storage } from "../storage";
import type {
  LendingMarket,
  LendingPosition,
  LendingSupply,
  LendingBorrow,
  LendingLiquidation,
  LendingRateHistory,
  LendingTransaction,
  InsertLendingMarket,
  InsertLendingPosition,
  InsertLendingSupply,
  InsertLendingBorrow,
  InsertLendingLiquidation,
  InsertLendingRateHistory,
  InsertLendingTransaction,
} from "@shared/schema";

const PRECISION = BigInt("1000000000000000000");
const BASIS_POINTS = 10000;
const SECONDS_PER_YEAR = 31536000;
const WAD = BigInt("1000000000000000000");
const RAY = BigInt("1000000000000000000000000000");

const LIQUIDATION_PARAMS = {
  closeFactorBps: 5000,
  protocolFeeBps: 10,
  flashLoanFeeBps: 9,
  minHealthFactor: 10000,
  warningHealthFactorBps: 12500,
} as const;

interface SupplyQuote {
  marketId: string;
  amountSupplied: string;
  sharesReceived: string;
  currentSupplyRate: number;
  estimatedYieldPerYear: string;
}

interface BorrowQuote {
  marketId: string;
  amountBorrowed: string;
  currentBorrowRate: number;
  newHealthFactor: number;
  remainingBorrowCapacity: string;
  estimatedInterestPerYear: string;
}

interface WithdrawQuote {
  marketId: string;
  amountWithdrawn: string;
  sharesBurned: string;
  newHealthFactor: number | null;
  withdrawableAmount: string;
}

interface RepayQuote {
  marketId: string;
  amountRepaid: string;
  remainingDebt: string;
  newHealthFactor: number;
}

interface LiquidationQuote {
  borrowerAddress: string;
  debtMarketId: string;
  collateralMarketId: string;
  maxDebtToCover: string;
  collateralToReceive: string;
  liquidationBonus: string;
  profitEstimate: string;
}

interface PositionSummary {
  userAddress: string;
  totalCollateralUsd: string;
  totalBorrowedUsd: string;
  healthFactor: number;
  borrowCapacityUsd: string;
  netApy: number;
  supplies: SupplyDetails[];
  borrows: BorrowDetails[];
}

interface SupplyDetails {
  marketId: string;
  assetSymbol: string;
  suppliedAmount: string;
  suppliedShares: string;
  valueUsd: string;
  supplyRate: number;
  isCollateral: boolean;
}

interface BorrowDetails {
  marketId: string;
  assetSymbol: string;
  borrowedAmount: string;
  valueUsd: string;
  borrowRate: number;
  rateMode: string;
}

interface MarketMetrics {
  marketId: string;
  totalSupply: string;
  totalBorrowed: string;
  utilizationRate: number;
  supplyRate: number;
  borrowRateVariable: number;
  borrowRateStable: number;
  availableLiquidity: string;
  collateralFactor: number;
  liquidationThreshold: number;
  liquidationPenalty: number;
  reserveFactor: number;
}

class LendingService {
  private rateUpdateInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private priceCache: Map<string, { price: string; timestamp: number }> = new Map();

  private getAssetPrice(assetAddress: string): string {
    const cached = this.priceCache.get(assetAddress);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.price;
    }
    return "1000000000000000000";
  }

  async getMarket(marketId: string): Promise<LendingMarket | undefined> {
    return storage.getLendingMarketById(marketId);
  }

  async getAllMarkets(): Promise<LendingMarket[]> {
    return storage.getAllLendingMarkets();
  }

  async getActiveMarkets(): Promise<LendingMarket[]> {
    return storage.getActiveLendingMarkets();
  }

  async getMarketByAsset(assetAddress: string): Promise<LendingMarket | undefined> {
    return storage.getLendingMarketByAsset(assetAddress);
  }

  calculateUtilizationRate(totalSupply: string, totalBorrowed: string): number {
    const supply = BigInt(totalSupply || "0");
    const borrowed = BigInt(totalBorrowed || "0");
    
    if (supply === BigInt(0)) return 0;
    
    const utilizationRay = (borrowed * RAY) / supply;
    return Number((utilizationRay * BigInt(BASIS_POINTS)) / RAY);
  }

  calculateInterestRates(utilizationBps: number, market: LendingMarket): {
    supplyRateBps: number;
    borrowRateBps: number;
  } {
    const baseRate = market.baseRate;
    const optimalUtilization = market.optimalUtilization;
    const slope1 = market.slope1;
    const slope2 = market.slope2;
    
    let borrowRateBps: number;
    
    if (utilizationBps <= optimalUtilization) {
      const slope = (slope1 * utilizationBps) / optimalUtilization;
      borrowRateBps = baseRate + slope;
    } else {
      const excessUtilization = utilizationBps - optimalUtilization;
      const maxExcess = BASIS_POINTS - optimalUtilization;
      const excessSlope = (slope2 * excessUtilization) / maxExcess;
      borrowRateBps = baseRate + slope1 + excessSlope;
    }

    const supplyRateBps = Math.floor(
      (borrowRateBps * utilizationBps * (BASIS_POINTS - market.reserveFactor)) / 
      (BASIS_POINTS * BASIS_POINTS)
    );

    return { supplyRateBps, borrowRateBps };
  }

  async calculateHealthFactor(userAddress: string): Promise<number> {
    const position = await storage.getLendingPositionByUser(userAddress);
    if (!position) return BASIS_POINTS * 100;

    const supplies = await storage.getLendingSuppliesByUser(userAddress);
    const borrows = await storage.getLendingBorrowsByUser(userAddress);

    if (borrows.length === 0) return BASIS_POINTS * 100;

    let totalWeightedCollateral = BigInt(0);
    let totalBorrowValue = BigInt(0);

    for (const supply of supplies) {
      if (!supply.isCollateral) continue;
      
      const market = await storage.getLendingMarketById(supply.marketId);
      if (!market) continue;

      const assetPrice = this.getAssetPrice(supply.assetAddress);
      const supplyValue = BigInt(supply.suppliedAmount) * BigInt(assetPrice) / PRECISION;
      const weightedCollateral = (supplyValue * BigInt(market.liquidationThreshold)) / BigInt(BASIS_POINTS);
      totalWeightedCollateral += weightedCollateral;
    }

    for (const borrow of borrows) {
      const market = await storage.getLendingMarketById(borrow.marketId);
      if (!market) continue;

      const assetPrice = this.getAssetPrice(borrow.assetAddress);
      const borrowValue = BigInt(borrow.borrowedAmount) * BigInt(assetPrice) / PRECISION;
      totalBorrowValue += borrowValue;
    }

    if (totalBorrowValue === BigInt(0)) return BASIS_POINTS * 100;

    const healthFactorBps = Number((totalWeightedCollateral * BigInt(BASIS_POINTS)) / totalBorrowValue);
    return healthFactorBps;
  }

  getHealthStatus(healthFactorBps: number): "healthy" | "at_risk" | "liquidatable" {
    if (healthFactorBps < LIQUIDATION_PARAMS.minHealthFactor) {
      return "liquidatable";
    } else if (healthFactorBps < LIQUIDATION_PARAMS.warningHealthFactorBps) {
      return "at_risk";
    }
    return "healthy";
  }

  async calculateBorrowCapacity(userAddress: string): Promise<string> {
    const supplies = await storage.getLendingSuppliesByUser(userAddress);
    const borrows = await storage.getLendingBorrowsByUser(userAddress);

    let totalCollateralCapacity = BigInt(0);
    let totalBorrowedValue = BigInt(0);

    for (const supply of supplies) {
      if (!supply.isCollateral) continue;
      
      const market = await storage.getLendingMarketById(supply.marketId);
      if (!market) continue;

      const assetPrice = this.getAssetPrice(supply.assetAddress);
      const supplyValue = BigInt(supply.suppliedAmount) * BigInt(assetPrice) / PRECISION;
      const borrowCapacity = (supplyValue * BigInt(market.collateralFactor)) / BigInt(BASIS_POINTS);
      totalCollateralCapacity += borrowCapacity;
    }

    for (const borrow of borrows) {
      const market = await storage.getLendingMarketById(borrow.marketId);
      if (!market) continue;

      const assetPrice = this.getAssetPrice(borrow.assetAddress);
      const borrowValue = BigInt(borrow.borrowedAmount) * BigInt(assetPrice) / PRECISION;
      totalBorrowedValue += borrowValue;
    }

    const remainingCapacity = totalCollateralCapacity > totalBorrowedValue 
      ? totalCollateralCapacity - totalBorrowedValue 
      : BigInt(0);

    return remainingCapacity.toString();
  }

  async getSupplyQuote(
    userAddress: string,
    marketId: string,
    amount: string
  ): Promise<SupplyQuote> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    if (market.status !== "active") {
      throw new Error(`Market ${marketId} is not active for supplies`);
    }

    const amountBigInt = BigInt(amount);
    const totalSupply = BigInt(market.totalSupply || "0");
    const exchangeRate = BigInt(market.exchangeRate || "1000000000000000000");

    const sharesReceived = (amountBigInt * PRECISION) / exchangeRate;

    const supplyRateBps = market.supplyRate;
    const yearlyYield = (amountBigInt * BigInt(supplyRateBps)) / BigInt(BASIS_POINTS);

    return {
      marketId,
      amountSupplied: amount,
      sharesReceived: sharesReceived.toString(),
      currentSupplyRate: supplyRateBps,
      estimatedYieldPerYear: yearlyYield.toString(),
    };
  }

  async getBorrowQuote(
    userAddress: string,
    marketId: string,
    amount: string
  ): Promise<BorrowQuote> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    if (market.status !== "active" || !market.canBeBorrowed) {
      throw new Error(`Borrowing is not enabled for market ${marketId}`);
    }

    const availableLiquidity = BigInt(market.availableLiquidity || "0");
    const amountBigInt = BigInt(amount);

    if (amountBigInt > availableLiquidity) {
      throw new Error("Insufficient liquidity in market");
    }

    const borrowCapacity = await this.calculateBorrowCapacity(userAddress);
    if (amountBigInt > BigInt(borrowCapacity)) {
      throw new Error("Amount exceeds borrow capacity");
    }

    const currentHealthFactor = await this.calculateHealthFactor(userAddress);
    
    const assetPrice = this.getAssetPrice(market.assetAddress);
    const borrowValue = amountBigInt * BigInt(assetPrice) / PRECISION;
    const position = await storage.getLendingPositionByUser(userAddress);
    const currentBorrowed = BigInt(position?.totalBorrowedValueUsd || "0");
    const newBorrowed = currentBorrowed + borrowValue;
    const currentCollateral = BigInt(position?.totalCollateralValueUsd || "0");
    
    let newHealthFactor = BASIS_POINTS * 100;
    if (newBorrowed > BigInt(0)) {
      newHealthFactor = Number((currentCollateral * BigInt(BASIS_POINTS)) / newBorrowed);
    }

    const borrowRateBps = market.borrowRateVariable;
    const yearlyInterest = (amountBigInt * BigInt(borrowRateBps)) / BigInt(BASIS_POINTS);
    const remainingCapacity = BigInt(borrowCapacity) - amountBigInt;

    return {
      marketId,
      amountBorrowed: amount,
      currentBorrowRate: borrowRateBps,
      newHealthFactor,
      remainingBorrowCapacity: remainingCapacity > BigInt(0) ? remainingCapacity.toString() : "0",
      estimatedInterestPerYear: yearlyInterest.toString(),
    };
  }

  async getWithdrawQuote(
    userAddress: string,
    marketId: string,
    amount: string
  ): Promise<WithdrawQuote> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    const supply = await storage.getLendingSupply(userAddress, marketId);
    if (!supply) {
      throw new Error("No supply position found");
    }

    const amountBigInt = BigInt(amount);
    const suppliedAmount = BigInt(supply.suppliedAmount);

    if (amountBigInt > suppliedAmount) {
      throw new Error("Withdraw amount exceeds supplied amount");
    }

    const exchangeRate = BigInt(market.exchangeRate || "1000000000000000000");
    const sharesBurned = (amountBigInt * PRECISION) / exchangeRate;

    let newHealthFactor: number | null = null;
    if (supply.isCollateral) {
      const borrows = await storage.getLendingBorrowsByUser(userAddress);
      if (borrows.length > 0) {
        const assetPrice = this.getAssetPrice(market.assetAddress);
        const withdrawValue = amountBigInt * BigInt(assetPrice) / PRECISION;
        const position = await storage.getLendingPositionByUser(userAddress);
        const currentCollateral = BigInt(position?.totalCollateralValueUsd || "0");
        const newCollateral = currentCollateral - withdrawValue;
        const totalBorrowed = BigInt(position?.totalBorrowedValueUsd || "0");
        
        if (totalBorrowed > BigInt(0)) {
          newHealthFactor = Number((newCollateral * BigInt(BASIS_POINTS)) / totalBorrowed);
          
          if (newHealthFactor < LIQUIDATION_PARAMS.minHealthFactor) {
            throw new Error("Withdrawal would cause liquidation");
          }
        }
      }
    }

    const availableLiquidity = BigInt(market.availableLiquidity || "0");
    const withdrawable = amountBigInt > availableLiquidity ? availableLiquidity : amountBigInt;

    return {
      marketId,
      amountWithdrawn: amount,
      sharesBurned: sharesBurned.toString(),
      newHealthFactor,
      withdrawableAmount: withdrawable.toString(),
    };
  }

  async getRepayQuote(
    userAddress: string,
    marketId: string,
    amount: string
  ): Promise<RepayQuote> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    const borrow = await storage.getLendingBorrow(userAddress, marketId);
    if (!borrow) {
      throw new Error("No borrow position found");
    }

    const amountBigInt = BigInt(amount);
    const borrowedAmount = BigInt(borrow.borrowedAmount);
    const actualRepay = amountBigInt > borrowedAmount ? borrowedAmount : amountBigInt;
    const remainingDebt = borrowedAmount - actualRepay;

    const assetPrice = this.getAssetPrice(market.assetAddress);
    const repayValue = actualRepay * BigInt(assetPrice) / PRECISION;
    const position = await storage.getLendingPositionByUser(userAddress);
    const currentBorrowed = BigInt(position?.totalBorrowedValueUsd || "0");
    const newBorrowed = currentBorrowed - repayValue;
    const currentCollateral = BigInt(position?.totalCollateralValueUsd || "0");
    
    let newHealthFactor = BASIS_POINTS * 100;
    if (newBorrowed > BigInt(0)) {
      newHealthFactor = Number((currentCollateral * BigInt(BASIS_POINTS)) / newBorrowed);
    }

    return {
      marketId,
      amountRepaid: actualRepay.toString(),
      remainingDebt: remainingDebt.toString(),
      newHealthFactor,
    };
  }

  async getLiquidationQuote(
    liquidatorAddress: string,
    borrowerAddress: string,
    debtMarketId: string,
    collateralMarketId: string
  ): Promise<LiquidationQuote> {
    const position = await storage.getLendingPositionByUser(borrowerAddress);
    if (!position) {
      throw new Error("Borrower position not found");
    }

    const healthFactor = await this.calculateHealthFactor(borrowerAddress);
    if (healthFactor >= LIQUIDATION_PARAMS.minHealthFactor) {
      throw new Error("Position is not liquidatable");
    }

    const debtMarket = await storage.getLendingMarketById(debtMarketId);
    const collateralMarket = await storage.getLendingMarketById(collateralMarketId);
    
    if (!debtMarket || !collateralMarket) {
      throw new Error("Invalid market IDs");
    }

    const borrow = await storage.getLendingBorrow(borrowerAddress, debtMarketId);
    if (!borrow) {
      throw new Error("No debt in specified market");
    }

    const supply = await storage.getLendingSupply(borrowerAddress, collateralMarketId);
    if (!supply || !supply.isCollateral) {
      throw new Error("No collateral in specified market");
    }

    const debtAmount = BigInt(borrow.borrowedAmount);
    const maxDebtToCover = (debtAmount * BigInt(LIQUIDATION_PARAMS.closeFactorBps)) / BigInt(BASIS_POINTS);

    const debtPrice = this.getAssetPrice(debtMarket.assetAddress);
    const collateralPrice = this.getAssetPrice(collateralMarket.assetAddress);
    
    const debtValueUsd = maxDebtToCover * BigInt(debtPrice) / PRECISION;
    const collateralWithBonus = (debtValueUsd * BigInt(BASIS_POINTS + collateralMarket.liquidationPenalty)) / BigInt(BASIS_POINTS);
    const collateralToReceive = (collateralWithBonus * PRECISION) / BigInt(collateralPrice);

    const collateralAvailable = BigInt(supply.suppliedAmount);
    const actualCollateralReceived = collateralToReceive > collateralAvailable ? collateralAvailable : collateralToReceive;

    const bonus = (actualCollateralReceived * BigInt(collateralMarket.liquidationPenalty)) / BigInt(BASIS_POINTS);
    const profit = (bonus * BigInt(collateralPrice)) / PRECISION;

    return {
      borrowerAddress,
      debtMarketId,
      collateralMarketId,
      maxDebtToCover: maxDebtToCover.toString(),
      collateralToReceive: actualCollateralReceived.toString(),
      liquidationBonus: bonus.toString(),
      profitEstimate: profit.toString(),
    };
  }

  async supply(
    userAddress: string,
    marketId: string,
    amount: string,
    useAsCollateral: boolean = true
  ): Promise<{ supply: LendingSupply; transaction: LendingTransaction }> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    if (market.status !== "active") {
      throw new Error(`Market ${marketId} is not active`);
    }

    const quote = await this.getSupplyQuote(userAddress, marketId, amount);
    
    let position = await storage.getLendingPositionByUser(userAddress);
    if (!position) {
      position = await storage.createLendingPosition({
        userAddress,
        totalCollateralValueUsd: "0",
        totalBorrowedValueUsd: "0",
        healthFactor: BASIS_POINTS * 100,
        healthStatus: "healthy",
        suppliedAssetCount: 0,
        borrowedAssetCount: 0,
      });
    }
    
    let existingSupply = await storage.getLendingSupply(userAddress, marketId);
    let supply: LendingSupply;

    const assetPrice = this.getAssetPrice(market.assetAddress);
    const valueUsd = (BigInt(amount) * BigInt(assetPrice) / PRECISION).toString();

    if (existingSupply) {
      const newSupplied = BigInt(existingSupply.suppliedAmount) + BigInt(amount);
      const newShares = BigInt(existingSupply.suppliedShares) + BigInt(quote.sharesReceived);
      const newValueUsd = (BigInt(existingSupply.suppliedValueUsd) + BigInt(valueUsd)).toString();
      await storage.updateLendingSupply(existingSupply.id, {
        suppliedAmount: newSupplied.toString(),
        suppliedShares: newShares.toString(),
        suppliedValueUsd: newValueUsd,
        isCollateral: useAsCollateral,
      });
      supply = (await storage.getLendingSupply(userAddress, marketId))!;
    } else {
      supply = await storage.createLendingSupply({
        userAddress,
        marketId,
        positionId: position.id,
        assetAddress: market.assetAddress,
        suppliedAmount: amount,
        suppliedShares: quote.sharesReceived,
        suppliedValueUsd: valueUsd,
        isCollateral: useAsCollateral,
        supplyApy: market.supplyRate,
        interestEarned: "0",
      });
    }

    const newTotalSupply = BigInt(market.totalSupply || "0") + BigInt(amount);
    const newAvailableLiquidity = BigInt(market.availableLiquidity || "0") + BigInt(amount);
    await this.updateMarketState(marketId, {
      totalSupply: newTotalSupply.toString(),
      availableLiquidity: newAvailableLiquidity.toString(),
      totalSuppliers: market.totalSuppliers + (existingSupply ? 0 : 1),
    });

    await this.updateUserPosition(userAddress);

    const txHash = `th1${Array.from({length:52},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`;
    const transaction = await storage.createLendingTransaction({
      txHash,
      userAddress,
      marketId,
      positionId: position.id,
      assetAddress: market.assetAddress,
      assetSymbol: market.assetSymbol,
      txType: "supply",
      amount,
      shares: quote.sharesReceived,
      amountUsd: valueUsd,
      exchangeRate: market.exchangeRate,
      status: "completed",
    });

    return { supply, transaction };
  }

  async withdraw(
    userAddress: string,
    marketId: string,
    amount: string
  ): Promise<{ transaction: LendingTransaction }> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    const quote = await this.getWithdrawQuote(userAddress, marketId, amount);
    
    const supply = await storage.getLendingSupply(userAddress, marketId);
    if (!supply) {
      throw new Error("No supply position found");
    }

    const newSupplied = BigInt(supply.suppliedAmount) - BigInt(amount);
    const newShares = BigInt(supply.suppliedShares) - BigInt(quote.sharesBurned);
    const assetPrice = this.getAssetPrice(market.assetAddress);
    const withdrawValueUsd = BigInt(amount) * BigInt(assetPrice) / PRECISION;
    const newValueUsd = BigInt(supply.suppliedValueUsd) - withdrawValueUsd;

    if (newSupplied <= BigInt(0)) {
      await storage.deleteLendingSupply(supply.id);
    } else {
      await storage.updateLendingSupply(supply.id, {
        suppliedAmount: newSupplied.toString(),
        suppliedShares: newShares.toString(),
        suppliedValueUsd: newValueUsd > BigInt(0) ? newValueUsd.toString() : "0",
      });
    }

    const newTotalSupply = BigInt(market.totalSupply || "0") - BigInt(amount);
    const newAvailableLiquidity = BigInt(market.availableLiquidity || "0") - BigInt(amount);
    await this.updateMarketState(marketId, {
      totalSupply: newTotalSupply > BigInt(0) ? newTotalSupply.toString() : "0",
      availableLiquidity: newAvailableLiquidity > BigInt(0) ? newAvailableLiquidity.toString() : "0",
      totalSuppliers: newSupplied <= BigInt(0) ? Math.max(0, market.totalSuppliers - 1) : market.totalSuppliers,
    });

    await this.updateUserPosition(userAddress);

    const position = await storage.getLendingPositionByUser(userAddress);
    const txHash = `th1${Array.from({length:52},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`;
    const transaction = await storage.createLendingTransaction({
      txHash,
      userAddress,
      marketId,
      positionId: position?.id || "",
      assetAddress: market.assetAddress,
      assetSymbol: market.assetSymbol,
      txType: "withdraw",
      amount,
      shares: quote.sharesBurned,
      amountUsd: withdrawValueUsd.toString(),
      exchangeRate: market.exchangeRate,
      status: "completed",
    });

    return { transaction };
  }

  async borrow(
    userAddress: string,
    marketId: string,
    amount: string,
    rateMode: "variable" | "stable" = "variable"
  ): Promise<{ borrow: LendingBorrow; transaction: LendingTransaction }> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    if (!market.canBeBorrowed) {
      throw new Error(`Borrowing is not enabled for market ${marketId}`);
    }

    const quote = await this.getBorrowQuote(userAddress, marketId, amount);

    if (quote.newHealthFactor < LIQUIDATION_PARAMS.minHealthFactor) {
      throw new Error("Borrow would put position below liquidation threshold");
    }

    let position = await storage.getLendingPositionByUser(userAddress);
    if (!position) {
      position = await storage.createLendingPosition({
        userAddress,
        totalCollateralValueUsd: "0",
        totalBorrowedValueUsd: "0",
        healthFactor: BASIS_POINTS * 100,
        healthStatus: "healthy",
        suppliedAssetCount: 0,
        borrowedAssetCount: 0,
      });
    }

    let existingBorrow = await storage.getLendingBorrow(userAddress, marketId);
    let borrow: LendingBorrow;

    const assetPrice = this.getAssetPrice(market.assetAddress);
    const valueUsd = (BigInt(amount) * BigInt(assetPrice) / PRECISION).toString();

    if (existingBorrow) {
      const newBorrowed = BigInt(existingBorrow.borrowedAmount) + BigInt(amount);
      const newValueUsd = (BigInt(existingBorrow.borrowedValueUsd) + BigInt(valueUsd)).toString();
      await storage.updateLendingBorrow(existingBorrow.id, {
        borrowedAmount: newBorrowed.toString(),
        borrowedValueUsd: newValueUsd,
      });
      borrow = (await storage.getLendingBorrow(userAddress, marketId))!;
    } else {
      borrow = await storage.createLendingBorrow({
        userAddress,
        marketId,
        positionId: position.id,
        assetAddress: market.assetAddress,
        borrowedAmount: amount,
        borrowedShares: "0",
        borrowedValueUsd: valueUsd,
        rateMode,
        borrowApy: rateMode === "variable" ? market.borrowRateVariable : market.borrowRateStable,
        stableRate: rateMode === "stable" ? market.borrowRateStable : null,
        accruedInterest: "0",
      });
    }

    const newTotalBorrowed = BigInt(market.totalBorrowed || "0") + BigInt(amount);
    const newAvailableLiquidity = BigInt(market.availableLiquidity || "0") - BigInt(amount);
    await this.updateMarketState(marketId, {
      totalBorrowed: newTotalBorrowed.toString(),
      availableLiquidity: newAvailableLiquidity > BigInt(0) ? newAvailableLiquidity.toString() : "0",
      totalBorrowers: market.totalBorrowers + (existingBorrow ? 0 : 1),
    });

    await this.updateUserPosition(userAddress);

    const txHash = `th1${Array.from({length:52},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`;
    const transaction = await storage.createLendingTransaction({
      txHash,
      userAddress,
      marketId,
      positionId: position.id,
      assetAddress: market.assetAddress,
      assetSymbol: market.assetSymbol,
      txType: "borrow",
      amount,
      shares: "0",
      amountUsd: valueUsd,
      rateMode,
      interestRate: rateMode === "variable" ? market.borrowRateVariable : market.borrowRateStable,
      status: "completed",
    });

    return { borrow, transaction };
  }

  async repay(
    userAddress: string,
    marketId: string,
    amount: string
  ): Promise<{ transaction: LendingTransaction }> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) {
      throw new Error(`Market ${marketId} not found`);
    }

    const quote = await this.getRepayQuote(userAddress, marketId, amount);
    
    const borrow = await storage.getLendingBorrow(userAddress, marketId);
    if (!borrow) {
      throw new Error("No borrow position found");
    }

    const newBorrowed = BigInt(borrow.borrowedAmount) - BigInt(quote.amountRepaid);
    const assetPrice = this.getAssetPrice(market.assetAddress);
    const repayValueUsd = BigInt(quote.amountRepaid) * BigInt(assetPrice) / PRECISION;
    const newValueUsd = BigInt(borrow.borrowedValueUsd) - repayValueUsd;

    if (newBorrowed <= BigInt(0)) {
      await storage.deleteLendingBorrow(borrow.id);
    } else {
      await storage.updateLendingBorrow(borrow.id, {
        borrowedAmount: newBorrowed.toString(),
        borrowedValueUsd: newValueUsd > BigInt(0) ? newValueUsd.toString() : "0",
      });
    }

    const newTotalBorrowed = BigInt(market.totalBorrowed || "0") - BigInt(quote.amountRepaid);
    const newAvailableLiquidity = BigInt(market.availableLiquidity || "0") + BigInt(quote.amountRepaid);
    await this.updateMarketState(marketId, {
      totalBorrowed: newTotalBorrowed > BigInt(0) ? newTotalBorrowed.toString() : "0",
      availableLiquidity: newAvailableLiquidity.toString(),
      totalBorrowers: newBorrowed <= BigInt(0) ? Math.max(0, market.totalBorrowers - 1) : market.totalBorrowers,
    });

    await this.updateUserPosition(userAddress);

    const position = await storage.getLendingPositionByUser(userAddress);
    const txHash = `th1${Array.from({length:52},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`;
    const transaction = await storage.createLendingTransaction({
      txHash,
      userAddress,
      marketId,
      positionId: position?.id || "",
      assetAddress: market.assetAddress,
      assetSymbol: market.assetSymbol,
      txType: "repay",
      amount: quote.amountRepaid,
      shares: "0",
      amountUsd: repayValueUsd.toString(),
      healthFactorAfter: quote.newHealthFactor,
      status: "completed",
    });

    return { transaction };
  }

  async liquidate(
    liquidatorAddress: string,
    borrowerAddress: string,
    debtMarketId: string,
    collateralMarketId: string,
    debtToCover: string
  ): Promise<{ liquidation: LendingLiquidation; transaction: LendingTransaction }> {
    const quote = await this.getLiquidationQuote(
      liquidatorAddress,
      borrowerAddress,
      debtMarketId,
      collateralMarketId
    );

    const debtToCoverBigInt = BigInt(debtToCover);
    const maxDebt = BigInt(quote.maxDebtToCover);
    const actualDebtToCover = debtToCoverBigInt > maxDebt ? maxDebt : debtToCoverBigInt;

    const debtMarket = await storage.getLendingMarketById(debtMarketId);
    const collateralMarket = await storage.getLendingMarketById(collateralMarketId);
    
    if (!debtMarket || !collateralMarket) {
      throw new Error("Invalid markets");
    }

    const borrow = await storage.getLendingBorrow(borrowerAddress, debtMarketId);
    if (!borrow) {
      throw new Error("No borrow position");
    }

    const newBorrowed = BigInt(borrow.borrowedAmount) - actualDebtToCover;
    if (newBorrowed <= BigInt(0)) {
      await storage.deleteLendingBorrow(borrow.id);
    } else {
      await storage.updateLendingBorrow(borrow.id, {
        borrowedAmount: newBorrowed.toString(),
      });
    }

    const supply = await storage.getLendingSupply(borrowerAddress, collateralMarketId);
    if (!supply) {
      throw new Error("No collateral position");
    }

    const debtPrice = this.getAssetPrice(debtMarket.assetAddress);
    const collateralPrice = this.getAssetPrice(collateralMarket.assetAddress);
    
    const debtValueUsd = actualDebtToCover * BigInt(debtPrice) / PRECISION;
    const collateralWithBonus = (debtValueUsd * BigInt(BASIS_POINTS + collateralMarket.liquidationPenalty)) / BigInt(BASIS_POINTS);
    const collateralSeized = (collateralWithBonus * PRECISION) / BigInt(collateralPrice);

    const newCollateral = BigInt(supply.suppliedAmount) - collateralSeized;
    if (newCollateral <= BigInt(0)) {
      await storage.deleteLendingSupply(supply.id);
    } else {
      await storage.updateLendingSupply(supply.id, {
        suppliedAmount: newCollateral.toString(),
      });
    }

    const newTotalBorrowed = BigInt(debtMarket.totalBorrowed || "0") - actualDebtToCover;
    await this.updateMarketState(debtMarketId, {
      totalBorrowed: newTotalBorrowed > BigInt(0) ? newTotalBorrowed.toString() : "0",
    });

    const newTotalSupply = BigInt(collateralMarket.totalSupply || "0") - collateralSeized;
    await this.updateMarketState(collateralMarketId, {
      totalSupply: newTotalSupply > BigInt(0) ? newTotalSupply.toString() : "0",
    });

    const liquidationBonus = (collateralSeized * BigInt(collateralMarket.liquidationPenalty)) / BigInt(BASIS_POINTS);
    const healthFactorBefore = await this.calculateHealthFactor(borrowerAddress);

    const txHash = `th1${Array.from({length:52},()=>'abcdef0123456789'[Math.floor(Math.random()*16)]).join('')}`;
    
    const borrowerPosition = await storage.getLendingPositionByUser(borrowerAddress);
    
    const liquidation = await storage.createLendingLiquidation({
      borrowerAddress,
      liquidatorAddress,
      positionId: borrowerPosition?.id || "",
      collateralAsset: collateralMarket.assetAddress,
      collateralSymbol: collateralMarket.assetSymbol,
      debtAsset: debtMarket.assetAddress,
      debtSymbol: debtMarket.assetSymbol,
      debtRepaid: actualDebtToCover.toString(),
      debtRepaidUsd: debtValueUsd.toString(),
      collateralSeized: collateralSeized.toString(),
      collateralSeizedUsd: collateralWithBonus.toString(),
      liquidationBonus: liquidationBonus.toString(),
      protocolFee: "0",
      healthFactorBefore,
      healthFactorAfter: 0,
      closeFactorUsed: LIQUIDATION_PARAMS.closeFactorBps,
      txHash,
    });

    await this.updateUserPosition(borrowerAddress);
    
    const healthFactorAfter = await this.calculateHealthFactor(borrowerAddress);

    const position = await storage.getLendingPositionByUser(liquidatorAddress);
    const transaction = await storage.createLendingTransaction({
      txHash,
      userAddress: liquidatorAddress,
      marketId: debtMarketId,
      positionId: position?.id || "",
      assetAddress: debtMarket.assetAddress,
      assetSymbol: debtMarket.assetSymbol,
      txType: "liquidation",
      amount: actualDebtToCover.toString(),
      shares: "0",
      amountUsd: debtValueUsd.toString(),
      healthFactorAfter,
      status: "completed",
    });

    return { liquidation, transaction };
  }

  private async updateMarketState(marketId: string, updates: Partial<LendingMarket>): Promise<void> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) return;

    const totalSupply = updates.totalSupply || market.totalSupply;
    const totalBorrowed = updates.totalBorrowed || market.totalBorrowed;
    
    const utilizationRate = this.calculateUtilizationRate(totalSupply, totalBorrowed);
    const { supplyRateBps, borrowRateBps } = this.calculateInterestRates(utilizationRate, market);

    await storage.updateLendingMarket(marketId, {
      ...updates,
      utilizationRate,
      supplyRate: supplyRateBps,
      borrowRateVariable: borrowRateBps,
    });

    await storage.createLendingRateHistory({
      marketId,
      assetSymbol: market.assetSymbol,
      supplyRate: supplyRateBps,
      borrowRateVariable: borrowRateBps,
      borrowRateStable: market.borrowRateStable,
      utilizationRate,
      totalSupply,
      totalBorrowed,
    });
  }

  private async updateUserPosition(userAddress: string): Promise<void> {
    const supplies = await storage.getLendingSuppliesByUser(userAddress);
    const borrows = await storage.getLendingBorrowsByUser(userAddress);

    let totalCollateralValue = BigInt(0);
    let totalBorrowedValue = BigInt(0);

    for (const supply of supplies) {
      if (supply.isCollateral) {
        totalCollateralValue += BigInt(supply.suppliedValueUsd || "0");
      }
    }

    for (const borrow of borrows) {
      totalBorrowedValue += BigInt(borrow.borrowedValueUsd || "0");
    }

    const healthFactor = await this.calculateHealthFactor(userAddress);
    const healthStatus = this.getHealthStatus(healthFactor);

    const existingPosition = await storage.getLendingPositionByUser(userAddress);

    const positionData = {
      userAddress,
      totalCollateralValueUsd: totalCollateralValue.toString(),
      totalBorrowedValueUsd: totalBorrowedValue.toString(),
      healthFactor,
      healthStatus,
      suppliedAssetCount: supplies.length,
      borrowedAssetCount: borrows.length,
    };

    if (existingPosition) {
      await storage.updateLendingPosition(userAddress, positionData);
    } else if (supplies.length > 0 || borrows.length > 0) {
      await storage.createLendingPosition(positionData);
    }
  }

  async getUserPosition(userAddress: string): Promise<PositionSummary | null> {
    const position = await storage.getLendingPositionByUser(userAddress);
    if (!position) return null;

    const supplies = await storage.getLendingSuppliesByUser(userAddress);
    const borrows = await storage.getLendingBorrowsByUser(userAddress);

    const supplyDetails: SupplyDetails[] = [];
    const borrowDetails: BorrowDetails[] = [];

    let totalSupplyApy = 0;
    let totalBorrowApy = 0;
    let totalSupplyValue = BigInt(0);
    let totalBorrowValue = BigInt(0);

    for (const supply of supplies) {
      const market = await storage.getLendingMarketById(supply.marketId);
      if (!market) continue;

      const valueUsd = BigInt(supply.suppliedValueUsd || "0");
      totalSupplyValue += valueUsd;
      totalSupplyApy += market.supplyRate * Number(valueUsd);

      supplyDetails.push({
        marketId: supply.marketId,
        assetSymbol: market.assetSymbol,
        suppliedAmount: supply.suppliedAmount,
        suppliedShares: supply.suppliedShares,
        valueUsd: valueUsd.toString(),
        supplyRate: market.supplyRate,
        isCollateral: supply.isCollateral,
      });
    }

    for (const borrow of borrows) {
      const market = await storage.getLendingMarketById(borrow.marketId);
      if (!market) continue;

      const valueUsd = BigInt(borrow.borrowedValueUsd || "0");
      totalBorrowValue += valueUsd;
      totalBorrowApy += (borrow.rateMode === "variable" ? market.borrowRateVariable : market.borrowRateStable) * Number(valueUsd);

      borrowDetails.push({
        marketId: borrow.marketId,
        assetSymbol: market.assetSymbol,
        borrowedAmount: borrow.borrowedAmount,
        valueUsd: valueUsd.toString(),
        borrowRate: borrow.rateMode === "variable" ? market.borrowRateVariable : (borrow.stableRate || market.borrowRateStable),
        rateMode: borrow.rateMode,
      });
    }

    const weightedSupplyApy = totalSupplyValue > BigInt(0) ? Math.floor(totalSupplyApy / Number(totalSupplyValue)) : 0;
    const weightedBorrowApy = totalBorrowValue > BigInt(0) ? Math.floor(totalBorrowApy / Number(totalBorrowValue)) : 0;
    const netApy = weightedSupplyApy - weightedBorrowApy;

    const borrowCapacity = await this.calculateBorrowCapacity(userAddress);

    return {
      userAddress,
      totalCollateralUsd: position.totalCollateralValueUsd,
      totalBorrowedUsd: position.totalBorrowedValueUsd,
      healthFactor: position.healthFactor,
      borrowCapacityUsd: borrowCapacity,
      netApy,
      supplies: supplyDetails,
      borrows: borrowDetails,
    };
  }

  async getMarketMetrics(marketId: string): Promise<MarketMetrics | null> {
    const market = await storage.getLendingMarketById(marketId);
    if (!market) return null;

    return {
      marketId,
      totalSupply: market.totalSupply,
      totalBorrowed: market.totalBorrowed,
      utilizationRate: market.utilizationRate,
      supplyRate: market.supplyRate,
      borrowRateVariable: market.borrowRateVariable,
      borrowRateStable: market.borrowRateStable,
      availableLiquidity: market.availableLiquidity,
      collateralFactor: market.collateralFactor,
      liquidationThreshold: market.liquidationThreshold,
      liquidationPenalty: market.liquidationPenalty,
      reserveFactor: market.reserveFactor,
    };
  }

  async getLendingStats(): Promise<{
    totalValueLockedUsd: string;
    totalBorrowedUsd: string;
    totalMarkets: number;
    activeMarkets: number;
    totalUsers: number;
    avgSupplyRate: number;
    avgBorrowRate: number;
    avgUtilization: number;
    liquidations24h: number;
    atRiskPositions: number;
    liquidatablePositions: number;
  }> {
    return storage.getLendingStats();
  }

  async getLiquidatablePositions(): Promise<LendingPosition[]> {
    return storage.getLiquidatablePositions();
  }

  async getAtRiskPositions(): Promise<LendingPosition[]> {
    return storage.getAtRiskPositions();
  }

  async getRecentTransactions(limit: number = 20): Promise<LendingTransaction[]> {
    return storage.getRecentLendingTransactions(limit);
  }

  async getRecentLiquidations(limit: number = 20): Promise<LendingLiquidation[]> {
    return storage.getRecentLendingLiquidations(limit);
  }

  async getRateHistory(marketId: string, limit: number = 100): Promise<LendingRateHistory[]> {
    return storage.getLendingRateHistory(marketId, limit);
  }

  async createMarket(data: InsertLendingMarket): Promise<LendingMarket> {
    return storage.createLendingMarket(data);
  }

  startBackgroundTasks(): void {
    this.rateUpdateInterval = setInterval(async () => {
      try {
        const markets = await this.getActiveMarkets();
        for (const market of markets) {
          await this.updateMarketState(market.id, {});
        }
      } catch (error) {
        console.error("Error updating rates:", error);
      }
    }, 60000);

    this.healthCheckInterval = setInterval(async () => {
      try {
        const positions = await storage.getAllLendingPositions();
        for (const position of positions) {
          const healthFactor = await this.calculateHealthFactor(position.userAddress);
          const healthStatus = this.getHealthStatus(healthFactor);
          
          if (position.healthFactor !== healthFactor || position.healthStatus !== healthStatus) {
            await storage.updateLendingPosition(position.userAddress, {
              healthFactor,
              healthStatus,
            });
          }
        }
      } catch (error) {
        console.error("Error checking health factors:", error);
      }
    }, 30000);
  }

  stopBackgroundTasks(): void {
    if (this.rateUpdateInterval) {
      clearInterval(this.rateUpdateInterval);
      this.rateUpdateInterval = null;
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

export const lendingService = new LendingService();
