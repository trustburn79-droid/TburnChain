/**
 * Feature Flags - 5대 신기술 통합 제어
 * 
 * 환경 변수로 신기술 활성화 제어
 * 기본값: 모두 비활성 (안전 우선)
 */

export interface FeatureFlags {
  ENABLE_MODULAR_DA: boolean;
  ENABLE_RESTAKING: boolean;
  ENABLE_ZK_ROLLUP: boolean;
  ENABLE_ACCOUNT_ABSTRACTION: boolean;
  ENABLE_INTENT_ARCHITECTURE: boolean;
}

export const featureFlags: FeatureFlags = {
  ENABLE_MODULAR_DA: process.env.ENABLE_MODULAR_DA === 'true',
  ENABLE_RESTAKING: process.env.ENABLE_RESTAKING === 'true',
  ENABLE_ZK_ROLLUP: process.env.ENABLE_ZK_ROLLUP === 'true',
  ENABLE_ACCOUNT_ABSTRACTION: process.env.ENABLE_ACCOUNT_ABSTRACTION === 'true',
  ENABLE_INTENT_ARCHITECTURE: process.env.ENABLE_INTENT_ARCHITECTURE === 'true',
};

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

export function getActiveFeatures(): string[] {
  return Object.entries(featureFlags)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}

export function logFeatureStatus(): void {
  console.log('[FeatureFlags] 5대 신기술 통합 상태:');
  console.log(`  - 모듈러 DA: ${featureFlags.ENABLE_MODULAR_DA ? '✅ 활성' : '❌ 비활성'}`);
  console.log(`  - 리스테이킹: ${featureFlags.ENABLE_RESTAKING ? '✅ 활성' : '❌ 비활성'}`);
  console.log(`  - ZK 롤업: ${featureFlags.ENABLE_ZK_ROLLUP ? '✅ 활성' : '❌ 비활성'}`);
  console.log(`  - 어카운트 추상화: ${featureFlags.ENABLE_ACCOUNT_ABSTRACTION ? '✅ 활성' : '❌ 비활성'}`);
  console.log(`  - 인텐트 아키텍처: ${featureFlags.ENABLE_INTENT_ARCHITECTURE ? '✅ 활성' : '❌ 비활성'}`);
}
