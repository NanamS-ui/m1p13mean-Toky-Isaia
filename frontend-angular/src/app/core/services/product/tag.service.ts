import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Tag } from "../../models/product/tag.model";

@Injectable({
  providedIn: 'root',
})
export class TagService{
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}
    getTags():Observable<Tag[]>{
        return this.http.get<Tag[]>(`${this.apiBaseUrl}/tags`);
    }
    getTagById(id: string): Observable<Tag> {
        return this.http.get<Tag>(`${this.apiBaseUrl}/tags/${id}`);
    }
    
    createTag(payload: Partial<Tag>): Observable<Tag> {
        return this.http.post<Tag>(`${this.apiBaseUrl}/tags`, payload);
    }
    updateTag(id: string, payload: Partial<Tag>): Observable<Tag> {
        return this.http.put<Tag>(`${this.apiBaseUrl}/tags/${id}`, payload);
    }
    deleteTag(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/tags/${id}`);
    }
    

}