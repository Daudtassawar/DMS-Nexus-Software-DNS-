using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Application.Interfaces
{
    public interface IFinancialService
    {
        Task<ProfitLossResult> GetProfitLossAsync(DateTime start, DateTime end);
        Task<CashFlowResult> GetCashFlowAsync(DateTime start, DateTime end);
        Task<IEnumerable<string>> GetFinancialInsightsAsync();
        Task<SalesForecastResult> GetSalesForecastAsync();
        Task<object> GetBalanceSheetAsync();
    }

    public class ProfitLossResult
    {
        public decimal Revenue { get; set; }
        public decimal CostOfGoodsSold { get; set; }
        public decimal OperatingExpenses { get; set; }
        public decimal GrossProfit => Revenue - CostOfGoodsSold;
        public decimal NetProfit => GrossProfit - OperatingExpenses;
        public decimal MarginPercent => Revenue > 0 ? (GrossProfit / Revenue) * 100 : 0;
    }

    public class CashFlowResult
    {
        public decimal CashInflow { get; set; }
        public decimal CashOutflow { get; set; }
        public decimal NetCashFlow => CashInflow - CashOutflow;
    }

    public class SalesForecastResult
    {
        public IEnumerable<object> Historical { get; set; } = new List<object>();
        public IEnumerable<object> Forecast { get; set; } = new List<object>();
    }
}
