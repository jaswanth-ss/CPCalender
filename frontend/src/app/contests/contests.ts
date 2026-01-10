import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { platformsArray } from '../contest.model';

@Component({
  selector: 'app-contests',
  imports: [FormsModule],
  templateUrl: './contests.html',
  styleUrl: './contests.css',
})
export class Contests {
  platforms : string[] = platformsArray.map(p => p.split('.')[0]);
  filteredPlatforms : string[] = this.platforms;
  selectedPlatforms : string[] = [];
  searchInput:string = '';
  dropDown:boolean = false;
  onSearch(){

  }
  onInput(){
    this.filteredPlatforms = this.platforms.filter(a => a.toLowerCase().includes(this.searchInput.toLocaleLowerCase()));
  }
  selectOption(option : string){
    const index = this.selectedPlatforms.indexOf(option + ".com");
    if(index === -1){
      this.selectedPlatforms.push(option + ".com");
    }
    else{
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
  
}
