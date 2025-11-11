import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit {
  public name_user: string = '';
  public lista_maestros: any[] = [];
  public displayed_maestros: any[] = [];
  public searchTerm: string = '';
  public pageSize: number = 10;
  public currentPage: number = 1;
  public totalPages: number = 1;
  // sortMode: 'none' | 'id_desc' | 'name_asc'
  public sortMode: string = 'none';

  constructor(
    public facadeService: FacadeService,
    private maestrosService: MaestrosService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.obtenerMaestros();
  }

  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log('Lista maestros: ', this.lista_maestros);
        this.currentPage = 1;
        this.applyFilters();
      }, (error) => {
        alert('No se pudo obtener la lista de maestros');
      }
    );
  }

  public applyFilters() {
    let data = Array.isArray(this.lista_maestros) ? [...this.lista_maestros] : [];
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      data = data.filter(m => {
        const parts = [m.id?.toString(), m.rfc, m.cubiculo, m.user?.first_name, m.user?.last_name, m.user?.email];
        return parts.join(' ').toLowerCase().includes(term);
      });
    }

    if (this.sortMode === 'id_desc') {
      data.sort((x, y) => (y.id || 0) - (x.id || 0));
    } else if (this.sortMode === 'name_asc') {
      data.sort((x, y) => ((x.user?.last_name || '') + (x.user?.first_name || '')).localeCompare((y.user?.last_name || '') + (y.user?.first_name || '')));
    }

    this.totalPages = Math.max(1, Math.ceil(data.length / this.pageSize));
    if (this.currentPage > this.totalPages) { this.currentPage = this.totalPages; }
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayed_maestros = data.slice(start, start + this.pageSize);
  }

  public onSearchChange(value: string) {
    this.searchTerm = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  public toggleSort() {
    if (this.sortMode === 'none') { this.sortMode = 'id_desc'; }
    else if (this.sortMode === 'id_desc') { this.sortMode = 'name_asc'; }
    else { this.sortMode = 'none'; }
    this.currentPage = 1;
    this.applyFilters();
  }

  public goToPage(n: number) {
    if (n < 1 || n > this.totalPages) { return; }
    this.currentPage = n;
    this.applyFilters();
  }

  public get pagesArray(): any[] {
    return new Array(this.totalPages);
  }

  public goEditar(idUser: number) {
    this.router.navigate(['registro-usuarios/maestro/' + idUser]);
  }

  public delete(idUser: number) {
  }

}
