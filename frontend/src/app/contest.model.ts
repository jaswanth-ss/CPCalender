export interface ApiContest {
  id: number;
  event: string;
  start: string;
  end: string;
  duration: number;
  href: string;
  resource: string; 
  host: string;
  resource_id: number;
  [key: string]: any; 
}

export interface ContestModel {
  id: string;
  event: string;
  start: string;
  end: string;
  duration: number;
  href: string;
  resource: {
    id: number;
    name: string;
  };
  fetchedDate : string;
}
