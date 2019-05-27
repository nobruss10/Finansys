import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseResourceModel } from "../../model/base-resource.model";
import { BaseResourceService } from "../../services/base-resource.service";

import { switchMap } from 'rxjs/operators';
import toastr from 'toastr';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

    currentAction: string;
    resourceForm: FormGroup;
    pageTitle: string;
    serverErrorMessages: string[] = null;
    submittingForm: boolean = false;

    protected route: ActivatedRoute;
    protected router: Router;
    protected formBuild: FormBuilder;

    constructor(
        protected injector: Injector,
        public resource: T,
        protected resourceService: BaseResourceService<T>,
        protected jsonDataToResourceFn: (jsonData) => T
    ) {
        this.route = this.injector.get(ActivatedRoute);
        this.router = this.injector.get(Router);
        this.formBuild = this.injector.get(FormBuilder);
    }

    ngOnInit() {
        this.setCurrentAction();
        this.buildResourceForm();
        this.loadResource()
    }

    ngAfterContentChecked(): void {
        this.setPageTitle();
    }

    submitForm() {
        this.submittingForm = true;
        this.currentAction == 'new' ? this.createResource() : this.updateResource();
    }

    protected loadResource(): any {
        if (this.currentAction == 'edit') {
            this.route.paramMap.pipe(
                switchMap(params => this.resourceService.getById(parseInt(params.get('id')))
                )
            )
                .subscribe(
                    (resource) => {
                        this.resource = resource;
                        this.resourceForm.patchValue(resource) // binds loaded resource data to resourceForm
                    },
                    (error) => alert('Ocorreu um erro tente mais tarde')
                )
        }
    }

    private setCurrentAction(): any {
        this.route.snapshot.url[0].path == 'new' ? this.currentAction = 'new' : this.currentAction = 'edit'
    }

    private setPageTitle(): any {
        if (this.currentAction == 'new') {
            this.pageTitle = this.creatinPageTitle();
        }
        else {
            this.pageTitle = this.editionPageTitle();
        }
    }

    protected creatinPageTitle(): string {
        return "Novo";
    }

    protected editionPageTitle(): string {
        return "Edição";
    }

    private createResource(): any {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.create(resource)
            .subscribe(
                resource => this.actionForSuccess(resource),
                error => this.actionsForError(error)
            )
    }

    private updateResource(): any {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.update(resource)
            .subscribe(
                resource => this.actionForSuccess(resource),
                error => this.actionsForError(error)
            )
    }

    private actionsForError(error: any): void {
        toastr.error('Ocorreu um erro ao processar a sua solicitação!');

        this.submittingForm = false;

        if (error.status === 442)
            this.serverErrorMessages = JSON.parse(error.body).errors;
        else
            this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente mais tarde.']
    }

    private actionForSuccess(resource: T): void {
        toastr.success('Solictação processada com sucesso!');

        const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

        // redirect/reload component page
        this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true }).then(
            () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
        )
    }

    protected abstract buildResourceForm(): void;

}
