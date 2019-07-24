import { Component, OnInit } from '@angular/core';
import { SolicitudD } from './solicitudD.models';
import { SolicitudDService } from '../../services/service.index';

@Component({
  selector: 'app-solicitudes-descargas',
  templateUrl: './solicitudes-descargas.component.html',
  styles: []
})
export class SolicitudesDescargasComponent implements OnInit {
  // tslint:disable-next-line:typedef-whitespace
  prealtas: SolicitudD[] = [];
  // tslint:disable-next-line:no-inferrable-types
  cargando: boolean = true;
  // tslint:disable-next-line:no-inferrable-types
  totalRegistros: number = 0;
  // tslint:disable-next-line:no-inferrable-types
  desde: number = 0;

  constructor(public _prealtaService: SolicitudDService) { }

  ngOnInit() {
    this.cargarSolicitudesAgencia();
  }

  cargarSolicitudesAgencia() {
    this.cargando = true;
    this._prealtaService.cargarSolicitudes(this.desde)
    .subscribe(solicitudesD =>
      // this.totalRegistros = resp.total;
      this.prealtas = solicitudesD
    );
  }

  cambiarDesde(valor: number) {
    // tslint:disable-next-line:prefer-const
    let desde = this.desde + valor;
    console.log(desde);
    if (desde >= this._prealtaService.totalSolicitudesDescarga) {
      return;
    }
    if (desde < 0) {
      return;
    }
    this.desde += valor;
    this.cargarSolicitudesAgencia();

  }

  buscarSolicitudes(termino: string) {
    if (termino.length <= 0) {
      this.cargarSolicitudesAgencia();
      return;
    }
    this.cargando = true;
    this._prealtaService.buscarSolicitud(termino)
    .subscribe((prealtas: SolicitudD[]) => {
      this.prealtas = prealtas;
      this.cargando = false;

    });
  }

  borrarSolicitud( praalta: SolicitudD ) {

    this._prealtaService.borrarSolicitud( praalta._id )
            .subscribe( () =>  this.cargarSolicitudesAgencia() );

  }

}
