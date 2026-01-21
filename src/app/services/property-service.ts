import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private apiUrl = 'http://localhost:3000/properties';
  
  // BehaviorSubject to store and share selected property across components
  private selectedPropertySubject = new BehaviorSubject<Property | null>(null);
  public selectedProperty$ = this.selectedPropertySubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Fetch all properties from JSON Server
   */
  getProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl);
  }

  /**
   * Set the currently selected property
   */
  setSelectedProperty(property: Property | null): void {
    this.selectedPropertySubject.next(property);
  }

  /**
   * Get the currently selected property (synchronous)
   */
  getSelectedProperty(): Property | null {
    return this.selectedPropertySubject.value;
  }
}
