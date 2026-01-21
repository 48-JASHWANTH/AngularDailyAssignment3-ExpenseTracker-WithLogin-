import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property.model';
import { PropertyService } from '../../services/property-service';

@Component({
  selector: 'app-properties',
  imports: [CommonModule],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties implements OnInit {
  properties: Property[] = [];
  selectedProperty: Property | null = null;
  showAllProperties = false;

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.loadProperties();
    this.propertyService.selectedProperty$.subscribe(property => {
      this.selectedProperty = property;
      this.showAllProperties = property === null;
    });
  }

  loadProperties(): void {
    this.propertyService.getProperties().subscribe({
      next: (properties) => {
        this.properties = properties;
        // Set first property as default if none selected
        if (!this.selectedProperty && properties.length > 0) {
          this.selectProperty(properties[0]);
        }
      },
      error: (error) => console.error('Error loading properties:', error)
    });
  }

  selectProperty(property: Property): void {
    this.propertyService.setSelectedProperty(property);
    this.showAllProperties = false;
  }

  selectAllProperties(): void {
    this.propertyService.setSelectedProperty(null);
    this.showAllProperties = true;
  }

  isSelected(property: Property): boolean {
    return this.selectedProperty?.id === property.id;
  }
}
