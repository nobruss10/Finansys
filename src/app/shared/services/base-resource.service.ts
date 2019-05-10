import { HttpClient } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injector } from '@angular/core';

import { BaseResourceModel } from '../model/base-resource.model';


export abstract class BaseResourceService<T extends BaseResourceModel> {
    protected http: HttpClient;

    constructor(protected apiPath: string, protected injector: Injector) {
        this.http = injector.get(HttpClient);
    }

    getAll(): Observable<T[]> {
        return this.http.get(this.apiPath).pipe(
            catchError(this.handleError),
            map(this.jsonDataToResources)
        )
    }

    getById(id: number): Observable<T> {
        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
            catchError(this.handleError),
            map(this.jsonDataToResource)
        )
    }

    create(resource: T): Observable<T> {
        return this.http.post(this.apiPath, resource).pipe(
            catchError(this.handleError),
            map(this.jsonDataToResource)
        )
    }

    update(category: T): Observable<T> {
        const url = `${this.apiPath}/${category.id}`;
        return this.http.put(url, category).pipe(
            catchError(this.handleError),
            map(this.jsonDataToResource)
        )
    }

    delete(category: T): Observable<any> {
        const url = `${this.apiPath}/${category.id}`;
        return this.http.delete(url).pipe(
            catchError(this.handleError),
            map(() => null)
        )
    }


    protected jsonDataToResources(jsonData: any[]): T[] {
        const resources: T[] = [];
        jsonData.forEach(e => resources.push(e as T));
        return resources;
    }

    protected jsonDataToResource(jsonData: any): T {
        return jsonData as T;
    }

    protected handleError(error: any): Observable<any> {
        console.log("ERRO NA REQUISIÇÃO => ", error)
        return throwError(error);
    }

}