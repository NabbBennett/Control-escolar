import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {
  public name_user: string = '';
  public lista_alumnos: any[] = [];
  public displayed_alumnos: any[] = [];
  public searchTerm: string = '';
  public pageSize: number = 10;
  public currentPage: number = 1;
  public totalPages: number = 1;
  // sortMode: 'none' | 'matricula_desc' | 'curp_asc'
  public sortMode: string = 'none';

  constructor(
    public facadeService: FacadeService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.obtenerAlumnos();
  }

  public obtenerAlumnos() {
    const token = this.facadeService.getSessionToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) { headers = headers.set('Authorization', 'Bearer ' + token); }
    this.http.get<any>(`${environment.url_api}/lista-alumnos/`, { headers }).subscribe(
      (resp) => { this.lista_alumnos = resp; console.log('Lista alumnos: ', resp); this.currentPage = 1; this.applyFilters(); },
      (err) => { alert('No se pudo obtener la lista de alumnos'); }
    );
  }

  public applyFilters() {
    let data = Array.isArray(this.lista_alumnos) ? [...this.lista_alumnos] : [];
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      data = data.filter(a => {
        const parts = [a.matricula, a.curp, a.ocupacion, a.user?.first_name, a.user?.last_name, a.user?.email];
        return parts.join(' ').toLowerCase().includes(term);
      });
    }

    if (this.sortMode === 'matricula_desc') {
      data.sort((x, y) => {
        // numeric-aware compare, but matricula could be string
        const ax = x?.matricula?.toString() || '';
        const ay = y?.matricula?.toString() || '';
        return ay.localeCompare(ax, undefined, { numeric: true });
      });
    } else if (this.sortMode === 'curp_asc') {
      data.sort((x, y) => (x?.curp || '').localeCompare(y?.curp || ''));
    }

    this.totalPages = Math.max(1, Math.ceil(data.length / this.pageSize));
    if (this.currentPage > this.totalPages) { this.currentPage = this.totalPages; }
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayed_alumnos = data.slice(start, start + this.pageSize);
  }

  public onSearchChange(value: string) {
    this.searchTerm = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  public toggleSort() {
    if (this.sortMode === 'none') { this.sortMode = 'matricula_desc'; }
    else if (this.sortMode === 'matricula_desc') { this.sortMode = 'curp_asc'; }
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
    this.router.navigate(['registro-usuarios/alumno/' + idUser]);
  }

  public delete(idUser: number) {
  }

}

