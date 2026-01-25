#!/bin/bash
# Security Check Script for TBURN API
# Checks for common security issues in API error responses

echo "==================================="
echo "TBURN Security Check"
echo "==================================="
echo ""

# Check for error.message exposures in API responses
echo "[1/4] Checking for error.message exposures..."
ERROR_MSG_COUNT=$(grep -r "error\.message" server/routes/*.ts 2>/dev/null | grep -v "console\." | grep -c "res\." || echo "0")

if [ "$ERROR_MSG_COUNT" -gt 0 ]; then
    echo "WARNING: Found $ERROR_MSG_COUNT potential error.message exposures"
    echo "Files with issues:"
    grep -r "error\.message" server/routes/*.ts 2>/dev/null | grep -v "console\." | grep "res\."
    echo ""
else
    echo "PASS: No error.message exposures in API responses"
fi

echo ""

# Check for raw SQL usage without parameterization
echo "[2/4] Checking for raw SQL usage..."
RAW_SQL_COUNT=$(grep -r "sql\.raw" server/routes/*.ts 2>/dev/null | wc -l)

if [ "$RAW_SQL_COUNT" -gt 0 ]; then
    echo "WARNING: Found $RAW_SQL_COUNT sql.raw() usages (verify input validation)"
    grep -rn "sql\.raw" server/routes/*.ts 2>/dev/null
    echo ""
else
    echo "PASS: No sql.raw() usage found"
fi

echo ""

# Check for missing CSRF on admin POST endpoints
echo "[3/4] Checking admin routes for CSRF protection..."
ADMIN_NO_CSRF=$(grep -E "app\.(post|put|patch|delete).*requireAdmin" server/routes.ts 2>/dev/null | grep -cv "validateCsrf" || echo "0")

if [ "$ADMIN_NO_CSRF" -gt 0 ]; then
    echo "WARNING: Found $ADMIN_NO_CSRF admin routes without CSRF protection"
else
    echo "PASS: All admin routes have CSRF protection"
fi

echo ""

# Check for console.log with sensitive data patterns
echo "[4/4] Checking for potential sensitive data logging..."
SENSITIVE_LOG=$(grep -rE "console\.log.*password|console\.log.*secret|console\.log.*token" server/ 2>/dev/null | wc -l)

if [ "$SENSITIVE_LOG" -gt 0 ]; then
    echo "WARNING: Found $SENSITIVE_LOG potential sensitive data in logs"
    grep -rn "console\.log.*password\|console\.log.*secret\|console\.log.*token" server/ 2>/dev/null
else
    echo "PASS: No sensitive data patterns in console.log"
fi

echo ""
echo "==================================="
echo "Security Check Complete"
echo "==================================="
