import { Component, OnInit, ViewChild } from '@angular/core';
import { Buque } from '../../models/buques.models';
import { BuqueService, ExcelService } from '../../services/service.index';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';

declare var swal: any;
@Component({
  selector: 'app-buques2',
  templateUrl: './buques2.component.html'
})

export class Buques2Component implements OnInit {
  buquesExcel = [];
  cargando: boolean = true;
  totalRegistros: number = 0;
  desde: number = 0;

  displayedColumns = ['actions', 'nombre', 'razonSocial', 'fAlta'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _buqueService: BuqueService, private _excelService: ExcelService) {
  }

  ngOnInit() {
    this.cargarBuques();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
    this.totalRegistros = this.dataSource.filteredData.length;
  }

  cargarBuques() {
    this.cargando = true;
    this._buqueService.getBuques(this.desde)
      .subscribe(buques => {
        this.dataSource = new MatTableDataSource(buques.buques);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.totalRegistros = buques.buques.length;
      });
    this.cargando = false;
  }

  borrarBuque(buque: Buque) {
    swal({
      title: '¿Esta seguro?',
      text: 'Esta apunto de borrar a ' + buque.nombre,
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    })
      .then(borrar => {
        if (borrar) {
          this._buqueService.borrarBuque(buque._id)
            .subscribe(() => this.cargarBuques());
        }
      });
  }

  CreaDatosExcel(datos) {
    datos.forEach(b => {
      var buque = {
        //Id: b._id,
        Buque: b.nombre,
        Naviera: b.naviera.razonSocial,
        UsuarioAlta: b.usuarioAlta.nombre,
        FAlta: b.fAlta.substring(0, 10)
      };
      this.buquesExcel.push(buque);
    });
  }

  exportAsXLSX(): void {
    this.CreaDatosExcel(this.dataSource.filteredData);
    if (this.buquesExcel) {
      this._excelService.exportAsExcelFile(this.buquesExcel, 'Buques');
    } else {
      swal('No se puede exportar un excel vacio', '', 'error');
    }
  }
}