export class Viaje {

    constructor(
        public viaje?: string,
        public buque?: string,
        public fArribo?: string,
        public fVigenciaTemporal?: string,
        public contenedores?: Array<any>,
        public pdfTemporal?: string,
        public usuarioAlta?: string,
        public fAlta?: string,
        public usuarioMod?: string,
        public fMod?: string,
        public _id?: string

    ) {}
}