
export function numberToWords(value: number): string {
    const units = ["", "UN ", "DOS ", "TRES ", "CUATRO ", "CINCO ", "SEIS ", "SIETE ", "OCHO ", "NUEVE "];
    const teens = ["DIEZ ", "ONCE ", "DOCE ", "TRECE ", "CATORCE ", "QUINCE ", "DIECISEIS ", "DIECISIETE ", "DIECIOCHO ", "DIECINUEVE "];
    const tens = ["", "", "VEINTE ", "TREINTA ", "CUARENTA ", "CINCUENTA ", "SESENTA ", "SETENTA ", "OCHENTA ", "NOVENTA "];
    const hundreds = ["", "CIENTO ", "DOSCIENTOS ", "TRESCIENTOS ", "CUATROCIENTOS ", "QUINIENTOS ", "SEISCIENTOS ", "SETECIENTOS ", "OCHOCIENTOS ", "NOVECIENTOS "];

    function convertGroup(n: number): string {
        let output = "";

        if (n === 100) return "CIEN ";

        if (n > 100) {
            output += hundreds[Math.floor(n / 100)];
            n %= 100;
        }

        if (n >= 10 && n <= 19) {
            output += teens[n - 10];
            return output;
        } else if (n >= 20) {
            if (n >= 21 && n <= 29) {
                // Special case for Veinti...
                const unit = n % 10;
                output += "VEINTI" + (unit > 0 ? units[unit].trim() : "") + " ";
                return output;
            }
            output += tens[Math.floor(n / 10)];
            n %= 10;
            if (n > 0) output += "Y ";
        }

        if (n > 0) {
            output += units[n];
        }
        return output;
    }

    if (value === 0) return "CERO PESOS";

    let formatted = Math.floor(value);
    let result = "";

    if (formatted >= 1000000000) {
        // Limits usually ok for receipts
        return "VALOR DEMASIADO ALTO";
    }

    if (formatted >= 1000000) {
        const millions = Math.floor(formatted / 1000000);
        if (millions === 1) result += "UN MILLON ";
        else result += convertGroup(millions) + "MILLONES ";
        formatted %= 1000000;
    }

    if (formatted >= 1000) {
        const thousands = Math.floor(formatted / 1000);
        if (thousands === 1) result += "MIL ";
        else result += convertGroup(thousands) + "MIL ";
        formatted %= 1000;
    }

    if (formatted > 0) {
        result += convertGroup(formatted);
    }

    return (result + "PESOS M/CTE").trim();
}
