import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ContestModel } from '../contest.model';

@Injectable({
  providedIn: 'root',
})
export class ContestService {
  private http = inject(HttpClient);
  private apiUrl = 'https://cpcalendar-fxexcdfbanbzhufc.southindia-01.azurewebsites.net/api/getcontestsfromblob';
  getContestsOnLoadService(params: {
    platforms?: string[];
    from?: string;
    to?: string;
  }):Observable<ContestModel[]>{
    return this.http.get<any>(this.apiUrl).pipe(
        map(res =>
          res.objects.map(
            (item: any): ContestModel => ({
              id: String(item.id),
              event: item.event,
              start: this.apiutcToIST(item.start),
              end: this.apiutcToIST(item.end),
              duration: item.duration,
              href: item.href,
              resource: {
                id: item.resource_id,
                name: item.resource,
              },
              fetchedDate: this.utcToIST(new Date().toISOString()),
            })
          )
        )
      );
  }

  getStartDate(){
    return new Date().toISOString().split('T')[0];
  }

  getEndDate(days : number, futureDay : Date = new Date()){
    futureDay.setDate(futureDay.getDate() + days + 1);
    return futureDay.toISOString().split('T')[0];
  }

  private apiutcToIST(utc: string): string {
    return new Date(utc+'Z').toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  private utcToIST(utc: string): string {
    return new Date(utc).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  toIST(date : Date): string{
     return new Date(date).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}

