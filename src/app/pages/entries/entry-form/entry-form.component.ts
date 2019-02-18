import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, Validator, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';
import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';
import { CategoriesModule } from '../../categories/categories.module';


@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();
  categories: Array<Category> = [];

  imaskConfig = {
    mask: Number,
    scale:2,
    thousandsSeparator: '',
    padFractionalZeros : true,
    nomalizeZeros: true,
    radix: ','
  }

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  }

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuild: FormBuilder,
    private categoryService : CategoryService
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCaregoryForm();
    this.loadEntry();
    this.loadCategories();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;
    this.currentAction == 'new' ? this.createEntry() : this.updateEntry();
  }

  private loadEntry(): any {
    if (this.currentAction == 'edit') {
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(parseInt(params.get('id')))
        )
      )
        .subscribe(
          (entry) => {
            this.entry = entry;
            this.entryForm.patchValue(entry) // binds loaded entry data to entryForm
          },
          (error) => alert('Ocorreu um erro tente mais tarde')
        )
    }
  }

  private buildCaregoryForm(): any {
    this.entryForm = this.formBuild.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]], 
      amount: [null, [Validators.required]] ,
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]
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
      const entryName = this.entry.name || '';
      this.pageTitle = `Editando Categoria: ${entryName}` ;
    }
  }

  private createEntry(): any {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.create(entry)
      .subscribe(
        entry => this.actionForSuccess(entry),
        error => this.actionsForError(error)
      )
  }

  private updateEntry(): any {
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    this.entryService.update(entry)
      .subscribe(
        entry => this.actionForSuccess(entry),
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

  get typeOptions(): any {
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          value: value,
          text: text
        }
      }
    )
  }

  private loadCategories() {
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    )
  }

  private actionForSuccess(entry: Entry): void {
    toastr.success('Solictação processada com sucesso!');
    
    // redirect/reload component page
    this.router.navigateByUrl('entries', {skipLocationChange: true}).then(
      () => this.router.navigate(['entries',entry.id, 'edit'])
    )
  }
 
}
