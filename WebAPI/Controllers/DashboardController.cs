using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Models;

namespace WebAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly InvoicikaDbContext _context;

    public DashboardController(InvoicikaDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var sixMonthsAgo = monthStart.AddMonths(-5);

        var invoices = await _context.CustomerInvoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .OrderByDescending(i => i.InvoiceDate)
            .ToListAsync();

        var customers = await _context.Customers.AsNoTracking().CountAsync();

        var monthlyInvoices = invoices.Where(i => i.InvoiceDate >= monthStart);
        var paidInvoices = invoices.Count(i => i.Status == InvoiceStatus.Paid);
        var pendingInvoices = invoices.Count(i => i.Status == InvoiceStatus.Pending);
        var draftInvoices = invoices.Count(i => i.Status == InvoiceStatus.Draft);

        var monthlyRevenue = monthlyInvoices
            .Where(i => i.Status == InvoiceStatus.Paid)
            .Sum(i => i.TotalAmount);

        var totalRevenue = invoices
            .Where(i => i.Status == InvoiceStatus.Paid)
            .Sum(i => i.TotalAmount);

        var trend = Enumerable.Range(0, 6)
            .Select(offset =>
            {
                var start = sixMonthsAgo.AddMonths(offset);
                var end = start.AddMonths(1);
                return new
                {
                    month = start.ToString("MMM"),
                    revenue = invoices
                        .Where(i => i.Status == InvoiceStatus.Paid &&
                                    i.InvoiceDate >= start &&
                                    i.InvoiceDate < end)
                        .Sum(i => i.TotalAmount),
                    invoices = invoices.Count(i => i.InvoiceDate >= start && i.InvoiceDate < end)
                };
            })
            .ToList();

        var statusDistribution = new[]
        {
            new { status = "Paid", count = paidInvoices },
            new { status = "Pending", count = pendingInvoices },
            new { status = "Draft", count = draftInvoices }
        };

        var recentInvoices = invoices
            .Take(8)
            .Select(i => new
            {
                id = i.CustomerInvoiceId,
                customerName = i.Customer?.Name ?? "Unknown",
                invoiceDate = i.InvoiceDate,
                totalAmount = i.TotalAmount,
                status = (int)i.Status
            });

        return Ok(new
        {
            totalRevenue,
            monthlyRevenue,
            totalInvoices = invoices.Count,
            monthlyInvoices = monthlyInvoices.Count(),
            paidInvoices,
            pendingInvoices,
            draftInvoices,
            totalCustomers = customers,
            trend,
            statusDistribution,
            recentInvoices
        });
    }
}
