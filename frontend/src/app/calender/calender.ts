import { Component, signal } from '@angular/core';
import { Contests } from '../contests/contests';
import { ContestService } from '../service/contest.service';
import { ContestModel, platformsArray } from '../contest.model';


@Component({
  selector: 'app-calender',
  imports: [],
  templateUrl: './calender.html',
  styleUrl: './calender.css',
})
export class Calender {
  constructor(private contestService: ContestService) { }

  error: string = '';
  contestData = signal<ContestModel[]>([]);
  platforms: string[] = platformsArray;
  startDate: string = '';
  endDate: string = '';
  days: Date[] = [];
  today: Date = new Date();

  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDayNames: string[] = [];

  ngOnInit() {
    this.startDate = this.contestService.getStartDate();
    this.endDate = this.contestService.getEndDate(30);
    const cachedData = localStorage.getItem('contests');
    if (cachedData) {
      this.contestData.set(JSON.parse(cachedData));
    }
    else {
      this.refreshContests();
    }
    this.generateCalendarDays();
    this.generateCalendarDayNames()
  }

  refreshContests() {
    this.contestService.getContestsOnLoadService({
      platforms: this.platforms,
      from: this.startDate,
      to: this.endDate
    }).subscribe({
      next: (data) => {
        this.contestData.set(data);
        try {
          localStorage.removeItem('contests');
          localStorage.setItem('contests', JSON.stringify(this.contestData()));
        } catch (err) {
          this.error = 'Failed to cache data';
        }
      },
      error: (err) => {
        this.error = 'Failed to fetch data';
      }
    });
  }

  generateCalendarDays() {
    const today = new Date();
    for (let i = 0; i < 28; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      this.days.push(date);
    }
    return this.days;
  }

  getDayName(date: Date): number{
    return this.dayNames.indexOf(date.toLocaleDateString('en-US', { weekday: 'short' }));
  }

  generateCalendarDayNames() {
    let todayNameInd = this.getDayName(this.today);
    for (let i = 0; i < 7; i++) {
       if(todayNameInd + i > 6){
        todayNameInd = todayNameInd - 7;
       }
       this.calendarDayNames.push(this.dayNames[todayNameInd + i]);
    }
  }

  getContestsOnDate(date : Date): ContestModel[] {
    const istDate = this.contestService.toIST(date);
    const contestsOnDate = this.contestData().filter(contest => this.compareTime(contest.start) === this.compareTime(istDate));
    return contestsOnDate;
  }

  private compareTime(time:string) : number{
    const t = new Date(time);
   t.setHours(0, 0, 0, 0);
    return t.getTime();
  }

}
