import { Component, signal, OnInit } from '@angular/core';
import { ContestService } from '../service/contest.service';
import { ContestModel } from '../contest.model';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

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
      if (JSON.parse(contestsData)[0].fetchedDate !== new Date().toISOString().split('T')[0]) {
        this.refreshData();
      }
      else {
        this.contests.set(JSON.parse(contestsData));
      }
    }
    else{
      this.refreshData();
    }
  }
  startDate: string = '';
  endDate: string = '';
  contests = signal<ContestModel[]>([]);
  error: string = '';
  isDataCached = false;
  constructor(private contestService: ContestService, private datePipe : DatePipe) { }

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
}
