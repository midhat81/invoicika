import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {
  sales = 11000;     // Total sales in dollars
  newOrders = 43;     // Number of new orders
  activeUsers = 15;
}
