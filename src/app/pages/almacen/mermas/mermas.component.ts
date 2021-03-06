import { MaterialService } from './../materiales/material.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Merma } from './merma.models';
import {
  MermaService,
  UsuarioService,
  ExcelService
} from '../../../services/service.index';

import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Usuario } from '../../usuarios/usuario.model';
import { ROLES } from 'src/app/config/config';
import { URL_SOCKET_IO, PARAM_SOCKET } from '../../../../environments/environment';
import * as io from 'socket.io-client';
import { VariasService } from '../../../services/shared/varias.service';
declare var swal: any;

@Component({
  selector: 'app-mermas',
  templateUrl: './mermas.component.html',
  styleUrls: ['./mermas.component.css']
})
export class MermasComponent implements OnInit {
  mermas: Merma[] = [];
  cargando = true;
  tablaCargar = false;
  totalRegistros = 0;
  usuarioLogueado: Usuario;
  mermasExcel = [];
  materiales;

  displayedColumns = [
    'actions',
    'fAlta',
    'motivo',
    'materiales',
    'fAprobacion',
  ];
  dataSource: any;
  socket = io(URL_SOCKET_IO, PARAM_SOCKET);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public mermaService: MermaService,
    private usuarioService: UsuarioService,
    private excelService: ExcelService,
    public matDialog: MatDialog,
    private materialService: MaterialService
  ) { }

  ngOnInit() {
    this.usuarioLogueado = this.usuarioService.usuario;
    this.cargarMermas();
    this.socket.on('new-merma', function () {
      this.cargarMermas();
    }.bind(this));

    this.socket.on('update-merma', function (data: any) {
      if (data.data._id) {
        this.cargarMermas();
      }
    }.bind(this));

    this.socket.on('delete-merma', function () {
      this.cargarMermas();
    }.bind(this));

    this.socket.on('aprobar-merma', function () {
      this.cargarMermas();
    }.bind(this));

    this.socket.on('desaprobar-merma', function () {
      this.cargarMermas();
    }.bind(this));
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    if (this.dataSource && this.dataSource.data.length > 0) {
      this.dataSource.filter = filterValue;
      this.totalRegistros = this.dataSource.filteredData.length;
      if (this.dataSource.filteredData.length === 0) {
        this.tablaCargar = true;
      } else {
        this.tablaCargar = false;
      }
    } else {
      console.error('No se puede filtrar en un datasource vacío');
    }
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnDestroy() {
    this.socket.removeListener('delete-merma');
    this.socket.removeListener('update-merma');
    this.socket.removeListener('new-merma');
  }

  cargarMermas() {
    this.cargando = true;

    this.mermaService.getMermas().subscribe(mermas => {
      this.dataSource = new MatTableDataSource(mermas.mermas);
      if (mermas.mermas.length === 0 || mermas.mermas === undefined) {
        this.tablaCargar = true;
      } else {
        this.tablaCargar = false;
      }
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.totalRegistros = mermas.mermas.length;
    });
    this.cargando = false;
  }

  borrarMerma(merma: Merma) {
    swal({
      title: '¿Esta seguro?',
      text: 'Esta apunto de borrar el registro',
      icon: 'warning',
      buttons: true,
      dangerMode: true
    }).then(borrar => {
      if (borrar) {
        this.mermaService
          .borrarMerma(merma)
          .subscribe(() => {
            this.socket.emit('deletemerma', merma);
          });
      }
    });
  }

  crearDatosExcel(datos) {
    let materiales = '';
    datos.forEach(d => {
      d.materiales.forEach(m => {
        materiales += `${m.material.descripcion}, `;
      });

      if (materiales) {
        materiales = materiales.substring(0, materiales.length - 1);
      }

      const mermas = {
        Motivo: d.motivo,
        Materiales: materiales,
        UsuarioAprobacion: d.usuarioAprobacion,
        FechaAprobacion: d.fAprobacion,
      };
      this.mermasExcel.push(mermas);
    });
  }

  exportarXLSX(): void {
    this.crearDatosExcel(this.dataSource.filteredData);
    if (this.mermasExcel != undefined && this.mermasExcel != null && this.mermasExcel.length > 0) {
      this.excelService.exportAsExcelFile(this.mermasExcel, 'Mermas');
    } else {
      swal('No se puede exportar un excel vacio', '', 'error');
    }
  }

  aprueba(merma: Merma) {
    swal({
      title: '¿Esta seguro?',
      text: 'Esta apunto de aprobar el registro',
      icon: 'warning',
      buttons: true,
      dangerMode: true
    }).then(borrar => {
      if (borrar) {
        let datos = merma.materiales;

        const start = async () => {
          let ok = false;
          await VariasService.asyncForEach(datos, async (d) => {
            const stock: any = await this.materialService.getStockMaterialAsync(d.material._id);
            if (stock.stock >= d.cantidad) {
              ok = true;
            } else {
              ok = false;
              return ok;
            }
          });
          return ok;
        };
        const aprob = start();

        aprob.then(res => {
          if (res) {
            swal("¿Quieres agregar un comentario?:", {
              content: "input",
            }).then((value) => {
              if (value && value !== null) {
                merma.comentarioAprobacion = value;
              } else {
                merma.comentarioAprobacion = '';
              }

              this.mermaService.aprobarMerma(merma).subscribe(() => {
                this.socket.emit('aprobarmerma', merma);
              });
            });
          } else {
            swal('No se puede aprobar esta merma por que no hay suficiente en Stock', '', 'error');
          }
        });
      }
    });
  }

  validaAprobacion(merma: Merma) {
    let ok = false;

    if ((this.usuarioLogueado.role === ROLES.ADMIN_ROLE || this.usuarioLogueado.role === ROLES.PATIOADMIN_ROLE) && merma.fAprobacion == undefined) {
      ok = true;
    } else {
      ok = false;
    }

    return ok;
  }

  validaDesaprobacion(merma: Merma) {
    let ok = false;

    if (this.usuarioLogueado.role === ROLES.ADMIN_ROLE && merma.fAprobacion !== undefined) {
      ok = true;
    } else {
      ok = false;
    }

    return ok;
  }

  desaprueba(merma: Merma) {
    swal({
      title: '¿Esta seguro?',
      text: 'Esta apunto de desaprobar el registro',
      icon: 'warning',
      buttons: true,
      dangerMode: true
    }).then(ok => {
      if (ok) {
        this.mermaService.DesaprobarMerma(merma).subscribe(() => {
          this.socket.emit('desaprobarmerma', merma);
        });
      }
    });
  }

}
