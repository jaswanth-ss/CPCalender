import { Component, signal, OnInit, computed } from '@angular/core';
import { ContestService } from '../service/contest.service';
import { ContestModel, platformsArray } from '../contest.model';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  providers: [DatePipe]
})

export class Dashboard implements OnInit {

  ngOnInit(): void {
    const contestsData = localStorage.getItem('contests');
    this.startDate = this.contestService.getStartDate();
    this.endDate = this.contestService.getEndDate(30);
    if (contestsData) {
      if (this.parseDate(JSON.parse(contestsData)[0].fetchedDate) !== this.parseDate(new Date().toISOString())) {
        this.isDataCached.set(false);
        this.refreshData();
      }
      else {
        this.isDataCached.set(true);
        this.contests.set(JSON.parse(contestsData));
        this.filteredContests.set(
          this.contests()
            .filter(c => this.compareTime(c.start) >= this.compareTime(c.fetchedDate))
            .slice(0, 5));
      }
    }
    else {
      this.isDataCached.set(false);
      this.refreshData();
    }
  }
  startDate: string = '';
  endDate: string = '';
  contests = signal<ContestModel[]>([]);
  filteredContests = signal<ContestModel[]>([]);
  error: string = '';
  isDataCached = signal<boolean>(false);
  platforms:string[] = platformsArray 
  
  constructor(private contestService: ContestService, private datePipe: DatePipe, private router: Router) { }

  refreshData() {
    this.isDataCached.set(false);
    this.contestService
      .getContestsOnLoadService({
        platforms: this.platforms,
        from: this.startDate,
        to: this.endDate,
      })
      .subscribe(data => {
        this.contests.set(data);
        this.filteredContests.set(
          this.contests()
            .filter(c => this.compareTime(c.start) >= this.compareTime(c.fetchedDate))
            .slice(0, 5));
        try {
          localStorage.removeItem('contests');
          localStorage.setItem('contests', JSON.stringify(this.contests()));
          this.isDataCached.set(true);
        } catch (err) {
          this.error = '';
        }
      });
  }

   parseDate(utc: string): number {
    const d = new Date(utc);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  private compareTime(time:string) : number{
    const t = new Date(time);
    return t.getTime();
  }

  viewAll() {
    this.router.navigate(['/contests']);
  }
}
