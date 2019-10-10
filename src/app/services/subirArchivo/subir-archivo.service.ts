import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '../../config/config';
import { FileItem } from '../../models/file-item.models';
import swal from 'sweetalert';
import { Observable, throwError } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { HttpClient , HttpEventType} from '@angular/common/http';

@Injectable()
export class SubirArchivoService {
  constructor(public http: HttpClient) { }

  subirArchivoTemporal(archivo: File, tipo: string ): Observable<any> {
      if (!archivo) {
      return;
    }
    const formData = new FormData();
    formData.append('file', archivo, archivo.name);
    const url = URL_SERVICIOS + '/uploadFileTemp';
    return this.http.put( url, formData )
    .pipe(map( (resp: any) => {
      swal('Archivo Cargado', resp.nombreArchivo, 'success');
      return resp.nombreArchivo;
    }),
    catchError( err => {
      swal( err.error.mensaje, err.error.errors.message, 'error' );
      return throwError(err);
    }));
  }

  subirArchivoBucketTemporal(archivo: File): Observable<any> {
    if (!archivo) {
    return;
  }
  
  const formData = new FormData();
  formData.append('file', archivo, archivo.name);
  const url = URL_SERVICIOS + '/uploadBucketTemp';
  return this.http.put( url, formData )
  .pipe(map( (resp: any) => {
    swal('Archivo Cargado', resp.nombreArchivo, 'success');
    return resp.nombreArchivo;
  }));
}

  cargarImagenesMongo(imagenes: FileItem[], tipo: string, id: string) {
    return new Promise((resolve, reject) => {
      for (const item of imagenes) {
        const formData = new FormData();
        formData.append('file', item.archivo, item.nombreArchivo);
        let url = URL_SERVICIOS + '/maniobras/addimg/';
        url += id;
        url += '&' + tipo;
        this.http.put( url, formData, {reportProgress: true, observe: 'events'} )
        .subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            item.progreso = Math.round( event.loaded / event.total * 100);
          } else if (event.type === HttpEventType.Response) {
            resolve(true);
            //console.log(event);
          }
        });
      }      
    });
  }

}
