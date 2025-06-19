// Strategy para calcular precio de pizza según tamaño, orilla, sabores y promo
export function calcularPrecio(tamano, orilla, saborArray, promo) {
    const tipoA = ["hawaiana", "peperoni", "quesos"];
    const tipoB = ["pastor", "vegetariana", "taxqueña", "carnes frías"];
    const tipoPremium = ["cochinita"];
    const extraQueso = "extra queso";

    let precioBase = 0;

    if (tamano === "individual") {
        precioBase = 40;
        if (orilla) precioBase = 60;
    } else if (tamano === "mediana") {
        const contieneCochinita = saborArray.some(s => tipoPremium.includes(s.toLowerCase()));
        if (contieneCochinita) {
            precioBase = saborArray.length === 1 ? 145 : 125; // completa o mitad
        } else {
            precioBase = promo === "promo_medianas" ? 110 : 125;
        }
    } else if (tamano === "cuadripizza") {
        precioBase = 330;
        if (orilla) precioBase = 400;
    } else if (tamano === "grande") {
        const contieneCochinita = saborArray.some(s => tipoPremium.includes(s.toLowerCase()));
        if (contieneCochinita) {
            precioBase = saborArray.length === 1 ? 180 : 160; // completa o mitad
        } else {
            const contieneSoloA = saborArray.every(s => tipoA.includes(s.toLowerCase()));
            const contieneSoloB = saborArray.every(s => tipoB.includes(s.toLowerCase()));

            if (contieneSoloA) precioBase = 150;
            else if (contieneSoloB) precioBase = 160;
            else precioBase = 160; // Combinación A y B
        }
    }

    // Agregar cargo por orilla y/o extra queso
    let precioFinal = precioBase;
    if (orilla && (tamano === "grande" || tamano === "mediana")) precioFinal += 35;
    if (saborArray.some(s => s.toLowerCase() === extraQueso)) precioFinal += 40;

    return precioFinal;
}