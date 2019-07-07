import { OnInit, AfterContentChecked } from '@angular/core';
import {BaseResourceModel} from '../../model/base-resource.model';
import {BaseResourceService} from '../../services/base-resource.service';

export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  constructor(private resourceService: BaseResourceService<T>) { }

  pageTitle : string;
  resources: T[] = []
  
  ngOnInit() {
    this.resourceService.getAll()
      .subscribe(
        resources => this.resources = resources.sort((a, b) => b.id - a.id),
        error => alert("Erro ao carregar a lista")
      )
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  deleteResource(resource: T) {
    const mostDelete = confirm("Deseja realmente excluir esse item?")

    if (mostDelete)
      this.resourceService.delete(resource)
        .subscribe(
          () => this.resources = this.resources.filter(element => element != resource),
          () => alert("Erro ao tentar excluir")
        )
  }

  private setPageTitle(): any {
        this.pageTitle = this.creatinPageTitle();
  }

  protected abstract creatinPageTitle(): string;   
}
