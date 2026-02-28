import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContestModel, platformsArray } from '../contest.model';
import { ContestService } from '../service/contest.service';
import { map } from 'rxjs';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-contests',
  imports: [FormsModule],
  templateUrl: './contests.html',
  styleUrl: './contests.css',
})
export class Contests {
  constructor(private contestService: ContestService) { }
  platforms: string[] = platformsArray.map(p => p.split('.')[0]);
  filteredPlatforms: string[] = this.platforms;
  selectedPlatforms: string[] = [];
  searchInput: string = '';
  startDate: string = '';
  endDate: string = '';
  dropDown: boolean = false;
  contests = signal<ContestModel[]>([]);
  isLoading = signal<boolean>(false);
  cachedContests = localStorage.getItem('contests');
  filteredCachedContest = signal<ContestModel[]>([]);

  onSearch() {
    if(this.startDate == '' || this.endDate == ''){
      this.startDate = this.contestService.getStartDate();
      this.endDate = this.contestService.getEndDate(30);
    }
    if(this.parseTime(this.startDate) >= this.parseTime(this.endDate)){
      alert("Please select correct start date and end date");
      this.contests.set([]);
      return;
    }
    this.filteredCachedContest.set([]);
    if(this.selectedPlatforms.length == 0){
      this.selectedPlatforms = this.platforms.map(x => x + '.com' || x + '.jp');
    }
    this.contests.set([]);
    if (this.startDate >= this.contestService.getStartDate() && this.endDate <= this.contestService.getEndDate(30)) {
      if (this.cachedContests) {
        const contests = JSON.parse(this.cachedContests);
        for (const platform of this.selectedPlatforms) {
          this.filteredCachedContest.update(arr => [...arr, ...contests.filter((c: { resource: { name: string } }) => c.resource.name == platform)
          ]);
        }
        this.contests.set(
          this.filteredCachedContest().filter((c: { start: string; end: string; }) => this.parseTime(c.start) >= this.parseTime(this.startDate) && this.parseTime(c.end) <= this.parseTime(this.endDate))
        )
      }
    }
    else {
      this.isLoading.set(true);
      this.contestService.getContestsOnLoadService({
        platforms: this.selectedPlatforms,
        from: this.startDate,
        to: this.contestService.getEndDate(1, new Date(`${this.endDate}T00:00:00`))
      }).subscribe(data => {
        this.isLoading.set(false);
        this.contests.set(data);
        this.selectedPlatforms = [];
      });
    }
    this.selectedPlatforms = [];
    this.searchInput = "";
  }

  onInput() {
    this.filteredPlatforms = this.platforms.filter(a => a.toLowerCase().includes(this.searchInput.toLocaleLowerCase()));
  }

  selectOption(option: string) {
    const index = this.selectedPlatforms.indexOf(option + ".com") == -1 ? this.selectedPlatforms.indexOf(option + ".jp") : this.selectedPlatforms.indexOf(option + ".com");
    const checkbox = document.getElementsByClassName('platform-'+option)[0] as HTMLInputElement | null;
    if(checkbox){
      checkbox.checked = !checkbox.checked;
    }
    if (index === -1) {
      if(option == "atcoder"){
        this.selectedPlatforms.push(option + ".jp");
      }
      else{
         this.selectedPlatforms.push(option + ".com");
      }
     
    }
    else {
      this.selectedPlatforms.splice(index, 1);
    }
    this.searchInput = this.selectedPlatforms.map(i => i.split(".")[0]).join(",");
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.platformSearch') && !target.closest('.platformLabel')) {
      this.dropDown = false;
      this.filteredPlatforms = this.platforms;
    }
  }

  parseDate(utc: string): string {
    const d = new Date(utc).toISOString().split('T')[0];
    return d;
  }

  parseTime(date: string): number {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  selectedPlatform(platform: string): boolean {
    return this.selectedPlatforms.includes(platform + ".com") || this.selectedPlatforms.includes(platform + ".jp"); 
  }


}
