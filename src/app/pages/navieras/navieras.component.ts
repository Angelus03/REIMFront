import { Component, OnInit } from '@angular/core';
import { Naviera } from '../../models/navieras.models';
import { NavieraService } from '../../services/service.index';
declare var swal: any;
@Component({
  selector: 'app-navieras',
  templateUrl: './navieras.component.html',
  styles: []
})
export class NavierasComponent implements OnInit {

  navieras: Naviera[] = [];
  cargando = true;
  desde = 0;
  totalRegistros = 0;

  constructor(public _navieraService: NavieraService) { }

  ngOnInit() {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.cargando = true;
    this._navieraService.getNavieras(this.desde)
    .subscribe((navieras: any) => {
      this.totalRegistros = navieras.total;
      this.navieras  = navieras.navieras;
      this.cargando = false;
    });
  }

  cambiarDesde(valor: number) {
    const desde = this.desde + valor;
    if (desde >= this.totalRegistros) {
      return;
    }
    if (desde < 0) {
      return;
    }
    this.desde += valor;
    this.cargarRegistros();
  }

  borrarRegistro( naviera: Naviera ) {
    swal({
      title: '¿Esta seguro?',
      text: 'Esta apunto de borrar a ' + naviera.razonSocial,
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      })
      .then(borrar => {
        if (borrar) {
          this._navieraService.borrarNaviera(naviera._id)
          .subscribe(borrado => {
            this.cargarRegistros();
          });
        }
      });
  }

  buscarNaviera(termino: string) {
    if (termino.length <= 0) {
      this.cargarRegistros();
      return;
    }
    this.cargando = true;
    this._navieraService.buscarNaviera(termino)
    .subscribe((navieras: Naviera[]) => {
      this.navieras = navieras;
      this.cargando = false;
    });
  }

}
