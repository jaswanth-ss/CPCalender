import { Component, signal, OnInit, computed } from '@angular/core';
import { ContestService } from '../service/contest.service';
import { ContestModel } from '../contest.model';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [DatePipe]
})
export class Dashboard implements OnInit {

  ngOnInit() : void {
    const contestsData = localStorage.getItem('contests');
    this.startDate= new Date().toISOString().split('T')[0];
    const futureDay = new Date();
    futureDay.setDate(futureDay.getDate()+30);
    this.endDate = futureDay.toISOString().split('T')[0];
    if (contestsData) {
      if (this.parseDate(JSON.parse(contestsData)[0].fetchedDate) !== this.parseDate(new Date().toISOString())) {
        this.refreshData();
      }
      else {
        this.contests.set(JSON.parse(contestsData));
        this.filteredContests.set(
          this.contests()
      .filter(c => c.start >= c.fetchedDate)
      .slice(0, 5));
      }
    }
    else{
      this.refreshData();
    }
  }

  startDate: string = '';
  endDate: string = '';
  contests = signal<ContestModel[]>([]);
  filteredContests = signal<ContestModel[]>([]);
  error: string = '';
  isDataCached = false;
  constructor(private contestService: ContestService, private datePipe : DatePipe, private router: Router) { }

  platforms: string[] = [
    'codeforces.com',
    'codechef.com',
    'leetcode.com',
    'atcoder.jp',
    'topcoder.com',
    'hackerrank.com',
  ];


  refreshData() {
    this.contestService
      .getContestsOnLoadService({
        platforms: this.platforms,
        from: this.startDate,
        to: this.endDate,
      })
      .subscribe(data => {
        this.contests.set(data);
        try {
          localStorage.removeItem('contests');
          localStorage.setItem('contests', JSON.stringify(this.contests()));
        } catch (err) {
          this.error = '';
        }
      });
  }

  private parseDate(utc: string): number {
    const d = new Date(utc);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  viewAll(){
    this.router.navigate(['/contests']);
  }
}
