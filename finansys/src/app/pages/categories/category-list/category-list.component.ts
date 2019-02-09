import { Component, OnInit } from '@angular/core';
import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  constructor(private categoryService: CategoryService) { }

  categories: Category[] = []

  ngOnInit() {
    this.categoryService.getAll()
      .subscribe(
        categories => this.categories = categories,
        error => alert("Erro ao carregar a lista")
      )
  }

  deleteCategory(category) {
    const mostDelete = confirm("Deseja realmente excluir esse item?")

    if (mostDelete)
      this.categoryService.delete(category)
        .subscribe(
          () => this.categories = this.categories.filter(element => element != category),
          () => alert("Erro ao tentar excluir")
        )
  }

}
