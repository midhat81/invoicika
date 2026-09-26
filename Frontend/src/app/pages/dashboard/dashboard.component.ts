import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';

interface DashboardData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalInvoices: number;
  monthlyInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  draftInvoices: number;
  totalCustomers: number;
  trend: Array<{ month: string; revenue: number; invoices: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
  recentInvoices: Array<{
    id: string;
    customerName: string;
    invoiceDate: string;
    totalAmount: number;
    status: number;
  }>;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  loading = true;
  error = false;

  data: DashboardData = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalInvoices: 0,
    monthlyInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    draftInvoices: 0,
    totalCustomers: 0,
    trend: [],
    statusDistribution: [],
    recentInvoices: []
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  get maxRevenue(): number {
    return Math.max(...this.data.trend.map(item => item.revenue), 1);
  }

  get statusTotal(): number {
    return this.data.paidInvoices + this.data.pendingInvoices + this.data.draftInvoices;
  }

  getStatusPercent(count: number): number {
    return this.statusTotal ? Math.round((count / this.statusTotal) * 100) : 0;
  }

  getRevenueBar(revenue: number): number {
    return Math.max(Math.round((revenue / this.maxRevenue) * 100), revenue > 0 ? 4 : 0);
  }

  trackByInvoiceId(_: number, invoice: DashboardData['recentInvoices'][number]): string {
    return invoice.id;
  }
}
