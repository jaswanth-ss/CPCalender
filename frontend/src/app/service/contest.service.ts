import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ContestModel } from '../contest.model';

@Injectable({
  providedIn: 'root',
})
export class ContestService {
  private http = inject(HttpClient);
  private apiUrl = 'https://cp-calender-fydpa5chgkhdb4dz.southindia-01.azurewebsites.net/api/getcontests';
  getContestsOnLoadService(params: {
    platforms?: string[];
    from?: string;
    to?: string;
  }):Observable<ContestModel[]>{
    let httpParams = new HttpParams();

    if (params.platforms && params.platforms.length > 0) {
      httpParams = httpParams.set('platforms', params.platforms.join(','));
    }

    if (params.from) {
      httpParams = httpParams.set('from', params.from);
    }

    if (params.to) {
      httpParams = httpParams.set('to', params.to);
    }

    console.log(params.platforms, params.from, params.to);
    return this.http.get<any>(this.apiUrl, {params : httpParams}).pipe(
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
}
