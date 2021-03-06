import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TiposContenedoresService } from './tipos-contenedores.service';

@Component({
  selector: 'app-tipo-contenedores',
  templateUrl: './tipo-contenedores.component.html',
  styleUrls: ['./tipo-contenedores.component.css']
})
export class TipoContenedoresComponent implements OnInit {
  tipoContenedor;
  regForm: FormGroup;
  url: string;

  constructor(private tiposContenedoresService: TiposContenedoresService,
    private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, private location: Location) {

   }

  ngOnInit() {
    this.createFormGroup();
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id !== 'nuevo') {
      this.cargarTipoContenedor(id);
    }
    else {
      for (var control in this.regForm.controls) {
        this.regForm.controls[control.toString()].setValue(undefined);
      }
    }
    this.url = '/tipos_contenedores';
  }

  cargarTipoContenedor (id: string){
    this.tiposContenedoresService.getTipoContenedor(id).subscribe((res) => {
      this.tipoContenedor = res;
        for (var propiedad in this.tipoContenedor){
          for (var control in this.regForm.controls){
            if (propiedad == control.toString()){
              this.regForm.controls[propiedad].setValue(res[propiedad]);
            }
          }
        }

    });
  }

  // javi(){
  //   console.log(this.tipoContenedor)
  // }

  get tipo() {
    return this.regForm.get('tipo');
  }

  get descripcion() {
    return this.regForm.get('descripcion');
  }

  get pies(){
    return this.regForm.get('pies');
  }

  get codigoISO() {
    return this.regForm.get('codigoISO');
  }

  createFormGroup() {
    this.regForm = this.fb.group({
      tipo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      pies: ['', [Validators.required]],
      codigoISO: ['', [Validators.required]],
      _id: ['']
    });
  }

  guardarTIpoContenedor(){
    if(this.regForm.valid) {
      // console.log(this.regForm.value)
      this.tiposContenedoresService.guardarContenedor(this.regForm.value)
      .subscribe(res => {
        if (this.regForm.get('_id').value === '' || this.regForm.get('_id').value === undefined) {
          this.regForm.get('_id').setValue(res._id);
          this.router.navigate(['/tipos_contenedores/tipoContenedor/', this.regForm.get('_id').value]);
        }
        this.regForm.markAsPristine();
      });
    }
  }

  back() {
    if (localStorage.getItem('history')) {
      this.url = localStorage.getItem('history');
    }
    this.router.navigate([this.url]);
    localStorage.removeItem('history')
    //this.location.back();
  }

}
