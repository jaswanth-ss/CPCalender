import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContestModel, platformsArray } from '../contest.model';
import { ContestService } from '../service/contest.service';

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
  isLoading: boolean = false;
  cachedContests = localStorage.getItem('contests');

  onSearch() {
    this.contests.set([]);
    alert(this.startDate > this.contestService.getStartDate())
    if (this.startDate >= this.contestService.getStartDate() && this.endDate <= this.contestService.getEndDate(30)) {
      if(this.cachedContests){
         this.contests.set(
        JSON.parse(this.cachedContests).filter((c: { startDate: string; endDate: string; }) => c.startDate >= this.startDate && c.endDate <= this.endDate)
      )
      }
    }
    else {
      this.isLoading = true;
      this.contestService.getContestsOnLoadService({
        platforms: this.selectedPlatforms,
        from: this.startDate,
        to: this.contestService.getEndDate(1, new Date(`${this.endDate}T00:00:00`))
      }).subscribe(data => {
        this.isLoading = false;
        this.contests.set(data);
      });
    }
  }

  onInput() {
    this.filteredPlatforms = this.platforms.filter(a => a.toLowerCase().includes(this.searchInput.toLocaleLowerCase()));
  }

  selectOption(option: string) {
    const index = this.selectedPlatforms.indexOf(option + ".com");
    if (index === -1) {
      this.selectedPlatforms.push(option + ".com");
    }
    else {
      this.selectedPlatforms.splice(index, 1);
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.platformSearch')) {
      this.dropDown = false;
      this.filteredPlatforms = this.platforms;
    }
  }

  parseDate(utc: string): string {
    const d = new Date(utc).toISOString().split('T')[0];
    return d;
  }


}
