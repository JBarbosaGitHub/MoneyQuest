/**
 * Corporate Income Tax (IRC/CIT) - Portugal (Simplified SME rule)
 *
 * Rule (provided):
 *  - For Small and Medium-sized Enterprises (SMEs), apply 16% on the first €50,000
 *    of taxable profit and 20% on the remaining amount above €50,000.
 *  - "Taxable profit" is the taxable income after accounting adjustments.
 *
 * This module exposes a simple function to compute tax given taxable profit.
 */

/**
 * Calculate Portuguese Corporate Income Tax (CIT/IRC) for SMEs.
 *
 * Contract:
 *  - Input: taxableProfit (number, in euros). Negative or zero results in 0 tax.
 *  - Output: { tax, effectiveRate, brackets }
 *      tax: total tax due in euros
 *      effectiveRate: tax / taxableProfit (0 if profit <= 0)
 *      brackets: breakdown per tier
 *
 * Edge cases:
 *  - profit <= 0 -> tax 0
 *  - profit <= 50_000 -> single tier at 16%
 *  - profit > 50_000 -> first 50k at 16%, rest at 20%
 */
export function calculateCITForSME(taxableProfit, options = {}) {
	const profit = Number(taxableProfit) || 0
	if (profit <= 0) return { tax: 0, effectiveRate: 0, brackets: [] }

	const TIER_LIMIT = options.tierLimit != null ? Number(options.tierLimit) : 50_000
	const RATE_LOWER = 0.16
	const RATE_UPPER = 0.20

	const lowerBase = Math.min(profit, TIER_LIMIT)
	const upperBase = Math.max(0, profit - TIER_LIMIT)

	const lowerTax = lowerBase * RATE_LOWER
	const upperTax = upperBase * RATE_UPPER
	const totalTax = lowerTax + upperTax

	const effectiveRate = profit > 0 ? totalTax / profit : 0

	return {
		tax: totalTax,
		effectiveRate,
		brackets: [
			{ base: lowerBase, rate: RATE_LOWER, tax: lowerTax },
			...(upperBase > 0 ? [{ base: upperBase, rate: RATE_UPPER, tax: upperTax }] : [])
		]
	}
}

/**
 * Convenience formatter for UI display with pt-PT locale.
 */
export function formatEUR(value) {
	return Number(value || 0).toLocaleString('pt-PT', {
		style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2
	})
}

/**
 * Convenience percentage formatter (e.g., 0.175 -> '17,5%').
 */
export function formatPercent(value) {
	return `${Number(value || 0).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`
}

export default {
	calculateCITForSME,
	formatEUR,
	formatPercent,
}

