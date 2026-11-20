export interface SQLPayload {
  domainId:string;
  solution:string;
  ordered:boolean;
  ai?:{version:number;provider:string;model:string;generatedAt:string;plan:unknown};
  verify?:string;
  catalog?:string;
  probes?:{sql:string; reject:boolean}[];
  transaction?:{table:string; end:'commit'|'rollback'};
}
export interface SQLDefinition extends Omit<SQLPayload,'domainId'|'ordered'> {
  ordered?:boolean;
  brief:string;
  extraSkills?:string[];
}
