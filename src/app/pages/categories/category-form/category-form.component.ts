import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, Validator, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';
import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { httpInMemBackendServiceFactory } from 'angular-in-memory-web-api';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuild: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCaregoryForm();
    this.loadCategory()
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    this.currentAction == 'new' ? this.createCategory() : this.updateCategory();
  }

  private loadCategory(): any {
    if (this.currentAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(parseInt(params.get('id')))
        )
      )
        .subscribe(
          (category) => {
            this.category = category;
            this.categoryForm.patchValue(category) // binds loaded category data to categoryForm
          },
          (error) => alert('Ocorreu um erro tente mais tarde')
        )
    }
  }

  private buildCaregoryForm(): any {
    this.categoryForm = this.formBuild.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    })
  }

  private setCurrentAction(): any {
    this.route.snapshot.url[0].path == 'new' ? this.currentAction = 'new' : this.currentAction = 'edit'
  }

  private setPageTitle(): any {
    if (this.currentAction == 'new') {
      this.pageTitle = 'Cadastro de Nova Categoria';
    }
    else {
      const categoryName = this.category.name || '';
      this.pageTitle = `Editando Categoria: ${categoryName}` ;
    }
  }

  private createCategory(): any {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.create(category)
      .subscribe(
        category => this.actionForSuccess(category),
        error => this.actionsForError(error)
      )
  }

  private updateCategory(): any {
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    this.categoryService.update(category)
      .subscribe(
        category => this.actionForSuccess(category),
        error => this.actionsForError(error)
      )
  }

  private actionsForError(error: any): void {
    toastr.error('Ocorreu um erro ao processar a sua solicitação!');

    this.submittingForm = false;

    if(error.status === 442)
      this.serverErrorMessages = JSON.parse(error.body).errors;
    else  
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente mais tarde.']
  }

  private actionForSuccess(category: Category): void {
    toastr.success('Solictação processada com sucesso!');
    
    // redirect/reload component page
    this.router.navigateByUrl('categories', {skipLocationChange: true}).then(
      () => this.router.navigate(['categories',category.id, 'edit'])
    )
  }
 
}
