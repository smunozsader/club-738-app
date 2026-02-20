/**
 * Datos FEMETI 2026 - Todas las modalidades con clubes por estado
 * Generado automáticamente desde MATRIZ_FEMETI_2026.csv
 * 
 * Uso: Al seleccionar modalidad + estado(s), el sistema auto-incluye
 * TODOS los clubes del estado que ofrecen esa modalidad.
 */

// Meses en español para temporalidad
const MESES_ES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

/**
 * Calcula la temporalidad del PETA:
 * Desde fecha solicitud + 15 días hasta 31 DIC del año
 */
export const calcularTemporalidad = (fechaSolicitud) => {
  const fecha = new Date(fechaSolicitud);
  fecha.setDate(fecha.getDate() + 15);
  
  const dia = fecha.getDate();
  const mes = MESES_ES[fecha.getMonth()];
  const año = fecha.getFullYear();
  
  return {
    inicio: `${dia} DE ${mes} ${año}`,
    fin: `31 DE DICIEMBRE ${año}`,
    textoCompleto: `${dia} DE ${mes} - 31 DE DICIEMBRE ${año}`
  };
};

/**
 * Datos de todas las modalidades FEMETI 2026
 */
export const MODALIDADES_FEMETI_2026 = {
  "BLANCOS EN MOVIMIENTO": {
    "tipoArma": "Escopeta",
    "calibres": "12, 20, .410",
    "estados": {
      "COAHUILA": {
        "display": "Coahuila",
        "clubes": [
          {
            "club": "Club Cinegetico Saltillo Safari AC",
            "domicilio": "Saltillo, Coah."
          }
        ],
        "totalEventos": 52
      },
      "JALISCO": {
        "display": "Jalisco",
        "clubes": [
          {
            "club": "Club de Tiro Arandense, A.C.",
            "domicilio": "Arandas, Jal."
          },
          {
            "club": "Club Cinegético Hálcones de Mascota, A.C.",
            "domicilio": "Mascota, Jal."
          },
          {
            "club": "Club Alianza de Cazadores Diana A.C.",
            "domicilio": "Zapopan, Jalisco"
          },
          {
            "club": "Club Cazadores de Tepatitlan, A.C.",
            "domicilio": "Tepatitlán, Jal."
          },
          {
            "club": "Club Cinegético Jalisciense, A.C.",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Club Cazadores de Tepatitlán, A.C.",
            "domicilio": "Tepatitlán, Jal."
          }
        ],
        "totalEventos": 121
      },
      "MEXICO": {
        "display": "Estado de México",
        "clubes": [
          {
            "club": "Club de Tiro Y Cinegético De Toluca A.C.",
            "domicilio": "Almoloya de Juárez, Mex."
          },
          {
            "club": "Club Asoc. de Caza y Pesca del D.F., A.C.",
            "domicilio": "Otzolotepec, Mex."
          },
          {
            "club": "Club de Caza, Tiro, Arqueria y Pesca, \"Aguilas de Atlacomulco, A.C.",
            "domicilio": "Atlacomulco, Méx."
          },
          {
            "club": "Club Asociación de Caaza y pesca del D.F., A.C.",
            "domicilio": "Otzolotepec, Mex."
          }
        ],
        "totalEventos": 84
      },
      "HIDALGO": {
        "display": "Hidalgo",
        "clubes": [
          {
            "club": "Club Cinegético Pachuca, A.C.",
            "domicilio": "Pachuca, Hgo."
          }
        ],
        "totalEventos": 50
      },
      "MICHOACAN": {
        "display": "Michoacán",
        "clubes": [
          {
            "club": "club campestre de caza tiro y pesca de acuña a.c.",
            "domicilio": "cd. acuña coah."
          },
          {
            "club": "Club Asoc. Cinegética Deportiva Michoacana, A.C.",
            "domicilio": "Morelia, Mich."
          },
          {
            "club": "Club Cinegético Halcones de Jacona, A.C.",
            "domicilio": "Jacona, Mich."
          },
          {
            "club": "Club Cinegético Morelia, A.C.",
            "domicilio": "Capula, Mich."
          },
          {
            "club": "Club Cinegético Morelos, A.C.",
            "domicilio": "Uruapan, Mich."
          }
        ],
        "totalEventos": 31
      },
      "GUANAJUATO": {
        "display": "Guanajuato",
        "clubes": [
          {
            "club": "Club Cinegético Leones, A.C.",
            "domicilio": "León, Gto."
          },
          {
            "club": "Club de Caza, Tiro y Pezca General Tomas Moreno A.C.",
            "domicilio": "Moroleón, Gto."
          },
          {
            "club": "Club Cinegético San Francisco, A.C.",
            "domicilio": "San Francisco del Rincon, Gto."
          },
          {
            "club": "Club Cinegético Anahuac, A.C.",
            "domicilio": "Irapuato, Gto."
          },
          {
            "club": "Club Cinegético General Tomas Moreno, A.C.",
            "domicilio": "Moroleon, Gto."
          }
        ],
        "totalEventos": 30
      },
      "SAN LUIS POTOSI": {
        "display": "San Luis Potosí",
        "clubes": [
          {
            "club": "Club Cinegético Los Condores Potosinos, A.C.",
            "domicilio": "San Luis Potosí, S.L.P."
          },
          {
            "club": "Club Cinegético y de Tiro Halcones, A.C.",
            "domicilio": "El Tepetate"
          },
          {
            "club": "Club Cinegético y de Tiro Hálcones, A.C.",
            "domicilio": "San Luis Potosí, S.L.P."
          }
        ],
        "totalEventos": 19
      },
      "NUEVO LEÓN": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Asoc. Regiomontana de Caza y Tiro, A.C.",
            "domicilio": "Santa Catarina, N.L."
          }
        ],
        "totalEventos": 6
      },
      "VERACRUZ": {
        "display": "Veracruz",
        "clubes": [
          {
            "club": "Club Orizaba de Caza, Tiro y Pesca. A.C.",
            "domicilio": "Orizaba"
          },
          {
            "club": "Club de Caza, Tiro y Pesca \" La Jauría \" A.C.",
            "domicilio": "Martínez de la Torre, Ver."
          }
        ],
        "totalEventos": 9
      },
      "QUERETARO": {
        "display": "Querétaro",
        "clubes": [
          {
            "club": "Club De Tiro Queretaro, A. C.",
            "domicilio": "Queretaro, Qro."
          },
          {
            "club": "Club de Tiro Querétaro, A.C.",
            "domicilio": "Querétaro, Qro."
          }
        ],
        "totalEventos": 5
      },
      "BAJA CALIFORNIA": {
        "display": "Baja California",
        "clubes": [
          {
            "club": "Club Dptvo. de C. T. y P. El Venado, A.C.",
            "domicilio": "Mexicali, B.C."
          }
        ],
        "totalEventos": 2
      },
      "NUEVO LEON": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Dptvo. de Cazadores Gatos Monteses, A.C.",
            "domicilio": "Monterrey, N.L."
          }
        ],
        "totalEventos": 2
      },
      "YUCATAN": {
        "display": "Yucatán",
        "clubes": [
          {
            "club": "Club Los Conejos de Caza y Tiro A.C.",
            "domicilio": "Baca, Yuc."
          }
        ],
        "totalEventos": 1
      }
    },
    "totalEstados": 13,
    "totalEventos": 412
  },
  "RECORRIDOS DE CAZA": {
    "tipoArma": "Escopeta",
    "calibres": "12, 20, .410",
    "estados": {
      "COAHUILA": {
        "display": "Coahuila",
        "clubes": [
          {
            "club": "Club Cinegetico Saltillo Safari AC",
            "domicilio": "Saltillo, Coah."
          }
        ],
        "totalEventos": 52
      },
      "JALISCO": {
        "display": "Jalisco",
        "clubes": [
          {
            "club": "Club Cinegético Jalisciense, A.C.",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Club Alianza de Cazadores Diana A.C.",
            "domicilio": "Zapopan, Jalisco"
          },
          {
            "club": "Club de Tiro Arandense, A.C.",
            "domicilio": "Arandas, Jal."
          },
          {
            "club": "Club Cinegético Celanese, A.C.",
            "domicilio": "Ocotlán, Jal."
          }
        ],
        "totalEventos": 118
      },
      "HIDALGO": {
        "display": "Hidalgo",
        "clubes": [
          {
            "club": "Club Cinegético Pachuca, A.C.",
            "domicilio": "Pachuca, Hgo."
          }
        ],
        "totalEventos": 50
      },
      "CHIAPAS": {
        "display": "Chiapas",
        "clubes": [
          {
            "club": "Club de Tiro Olimpico Chiapaneco A.C",
            "domicilio": "Berriozabal, Chiapas"
          },
          {
            "club": "CLUB DE TIRO, CAZA Y PESCA HALCONES ANIVERSARIO",
            "domicilio": "Tuxtla Gutierrez, Chis."
          }
        ],
        "totalEventos": 12
      },
      "MEXICO": {
        "display": "Estado de México",
        "clubes": [
          {
            "club": "Club Ferrocarrileros del Valle de México, A.C.",
            "domicilio": "Pueblo San Marcos Tecomaxusco, Ecatzingo Edo. Mex."
          }
        ],
        "totalEventos": 4
      },
      "GUERRERO": {
        "display": "Guerrero",
        "clubes": [
          {
            "club": "Club de C. T. y P. de Acapulco, A.C.",
            "domicilio": "Acapulco, Gro."
          },
          {
            "club": "Club de Caza y Tiro \"El Huixteco\"",
            "domicilio": "Taxco, Gro"
          },
          {
            "club": "Club Cinegético Yoguala de C. T. y P., A.C.",
            "domicilio": "Iguala, Gro."
          },
          {
            "club": "CLUB DE CAZA,TIRO Y PESCA CHILPANCINGO A. C.",
            "domicilio": "Chilpancingo, Gro."
          },
          {
            "club": "Club de C. T. y P. Chilpancingo, A.C.",
            "domicilio": "Chilpancingo, Gro."
          }
        ],
        "totalEventos": 100
      },
      "MÉX": {
        "display": "Méx",
        "clubes": [
          {
            "club": "Club de Caza, Tiro, Arqueria y Pesca, \"Aguilas de Atlacomulco, A.C.",
            "domicilio": "Atlacomulco, Méx."
          }
        ],
        "totalEventos": 1
      },
      "PUEBLA": {
        "display": "Puebla",
        "clubes": [
          {
            "club": "Club Caza Dptva. El Aguila, A.C.",
            "domicilio": "Pixtla, Pue."
          }
        ],
        "totalEventos": 24
      },
      "MICHOACAN": {
        "display": "Michoacán",
        "clubes": [
          {
            "club": "Club Cinegético Arteaga, A.C.",
            "domicilio": "Arteaga, Mich."
          },
          {
            "club": "Club Cinegético Morelia, A.C.",
            "domicilio": "Capula, Mich."
          },
          {
            "club": "Club Cinegético Morelos, A.C.",
            "domicilio": "Uruapan, Mich."
          }
        ],
        "totalEventos": 9
      },
      "SINALOA": {
        "display": "Sinaloa",
        "clubes": [
          {
            "club": "Club de Tiro, Caza y Pesca Lic. Miguel Aleman A.C.",
            "domicilio": "Culiacán, Sin."
          },
          {
            "club": "Club de Caza y Pesca de Sinaloa, A.C.",
            "domicilio": "Culiacán"
          }
        ],
        "totalEventos": 11
      },
      "NUEVO LEON": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Dptvo. Cazadores Monterrey, A.C.",
            "domicilio": "Monterrey, N. L."
          },
          {
            "club": "Club Rifle y Caña de Nuevo Leon, A.C.D.",
            "domicilio": "Garcia, N.L."
          }
        ],
        "totalEventos": 10
      },
      "ZACATECAS": {
        "display": "Zacatecas",
        "clubes": [
          {
            "club": "Club Cinegético Regional Jerezano, A.C. \"PUMAS\"",
            "domicilio": "Jerez, Zacatecas"
          }
        ],
        "totalEventos": 2
      },
      "NUEVO LEÓN": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Asoc. Regiomontana de Caza y Tiro, A.C.",
            "domicilio": "Santa Catarina, N.L."
          }
        ],
        "totalEventos": 5
      },
      "TABASCO": {
        "display": "Tabasco",
        "clubes": [
          {
            "club": "Club Cinegético de Caza, Tiro y Pesca el Tigre, A.C.",
            "domicilio": "Villahermosa, Tabasco"
          }
        ],
        "totalEventos": 1
      },
      "Q ROO": {
        "display": "Q Roo",
        "clubes": [
          {
            "club": "Club 78 C. T. y P., A.C.",
            "domicilio": "Valladolid, Q. Roo."
          }
        ],
        "totalEventos": 6
      },
      "YUCATAN": {
        "display": "Yucatán",
        "clubes": [
          {
            "club": "Club Los Conejos de Caza y Tiro A.C.",
            "domicilio": "Baca, Yuc."
          }
        ],
        "totalEventos": 4
      },
      "TAMAULIPAS": {
        "display": "Tamaulipas",
        "clubes": [
          {
            "club": "Club Dptvo. Reynosa, A.C.",
            "domicilio": "Cd. Reynosa, Tamps."
          }
        ],
        "totalEventos": 3
      },
      "YUCATÁN": {
        "display": "Yucatán",
        "clubes": [
          {
            "club": "Club de Caza, Tiro y Pesca de Yucatán A.C.",
            "domicilio": "Mérida, Yucatán"
          }
        ],
        "totalEventos": 4
      },
      "QUERETARO": {
        "display": "Querétaro",
        "clubes": [
          {
            "club": "Club De TIro Queretaro, A.C.",
            "domicilio": "Queretaro, Qro."
          },
          {
            "club": "Club de Caza, Tiro y Pesca Los Gamitos A.C.",
            "domicilio": "Querétaro, Mex."
          }
        ],
        "totalEventos": 9
      },
      "VERACRUZ": {
        "display": "Veracruz",
        "clubes": [
          {
            "club": "Club de Caza, Tiro y Pesca \"  La Jauría \" A.C.",
            "domicilio": "Martínez de la Torre, Ver."
          },
          {
            "club": "Club de Caza, Tiro y Pesca \" La Jauría \" A.C.",
            "domicilio": "Martínez de la Torre, Ver."
          }
        ],
        "totalEventos": 6
      },
      "AGUASCALIENTES": {
        "display": "Aguascalientes",
        "clubes": [
          {
            "club": "Club de Tiro y Cinegético Esparta, A.C.",
            "domicilio": "Aguascalientes, Ags"
          }
        ],
        "totalEventos": 3
      },
      "SAN LUIS POTOSI": {
        "display": "San Luis Potosí",
        "clubes": [
          {
            "club": "Club Cinegético y de Tiro Halcones, A.C.",
            "domicilio": "El Tepetate"
          }
        ],
        "totalEventos": 1
      },
      "BAJA CALIFORNIA": {
        "display": "Baja California",
        "clubes": [
          {
            "club": "Club C. T. y P. Berrendo, A.C.",
            "domicilio": "Tijuana, B.C."
          }
        ],
        "totalEventos": 1
      },
      "DURANGO": {
        "display": "Durango",
        "clubes": [
          {
            "club": "CLUB DE CAZA Y TIRO DE DURANGO, A.C.",
            "domicilio": "Durango, Dgo."
          }
        ],
        "totalEventos": 1
      }
    },
    "totalEstados": 24,
    "totalEventos": 465
  },
  "TIRO OLIMPICO": {
    "tipoArma": "Escopeta",
    "calibres": "12",
    "estados": {
      "GUERRERO": {
        "display": "Guerrero",
        "clubes": [
          {
            "club": "Club de C. T. y P. Chilpancingo, A.C.",
            "domicilio": "Chulpancingo, Gro."
          },
          {
            "club": "Club de C. T. y P. de Acapulco, A.C.",
            "domicilio": "Acapulco, Gro."
          },
          {
            "club": "Club Cinegético Yoguala de C. T. y P., A.C.",
            "domicilio": "Iguala, Gro."
          },
          {
            "club": "Club de Caza y Tiro \"El Huixteco\"",
            "domicilio": "Taxco, Gro."
          },
          {
            "club": "Club Acapulco de C. T. y P., A.C.",
            "domicilio": "Acapulco, Gro."
          },
          {
            "club": "Club de C. T. y P. Cazadores del Pacifico, A.C.",
            "domicilio": "Atoyac, Gro."
          },
          {
            "club": "Club Union de Cazadores del Sur, A.C.",
            "domicilio": "Iguala, Gro."
          }
        ],
        "totalEventos": 80
      },
      "COAHUILA": {
        "display": "Coahuila",
        "clubes": [
          {
            "club": "Club Cinegetico Saltillo Safari AC",
            "domicilio": "Saltillo, Coah."
          }
        ],
        "totalEventos": 52
      },
      "JALISCO": {
        "display": "Jalisco",
        "clubes": [
          {
            "club": "Club Cinegético Jalisciense, A.C. y CODE Jalisco",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Club Cinegético Jalisciense, A.C.",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Clasificatorio a olimpiada Nacional CONADE 2026",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Club Cinegético Celanese, A.C.",
            "domicilio": "Ocotlán, Jal."
          }
        ],
        "totalEventos": 27
      },
      "CHIAPAS": {
        "display": "Chiapas",
        "clubes": [
          {
            "club": "Club de Tiro, Caza y Pesca, Jaguar, A.C.",
            "domicilio": "Ocozocoautla de Espinosa, Chis."
          },
          {
            "club": "Club de C. T. y P. Hálcones, A.C.",
            "domicilio": "Tuxtla Gutierrez, Chis."
          },
          {
            "club": "Club de Tiro Olimpico Chiapaneco A.C.",
            "domicilio": "Berriozabal, Chiapas"
          }
        ],
        "totalEventos": 63
      },
      "MEXICO": {
        "display": "Estado de México",
        "clubes": [
          {
            "club": "Club Cinegético El Sable, A.C.",
            "domicilio": "Capulhuac. Mex."
          }
        ],
        "totalEventos": 1
      },
      "BAJA CALIFORNIA": {
        "display": "Baja California",
        "clubes": [
          {
            "club": "Club C. T. y P. Berrendo, A.C.",
            "domicilio": "Tijuana, B.C."
          },
          {
            "club": "Club C. T. y P. Faisanes, A.C.",
            "domicilio": "Mexicali, B.C."
          },
          {
            "club": "Club T. C. y P. Cimarrones, A.C.",
            "domicilio": "Mexicali, B.C."
          },
          {
            "club": "Club Dptvo. Zafari de el Sauzal, A.C.",
            "domicilio": "Ensenada, B.C."
          },
          {
            "club": "Club Tiro y Caza Panteras, A.C.",
            "domicilio": "Ensenada, B.C."
          },
          {
            "club": "Club Dptvo. de C. T. y P. El Venado, A.C.",
            "domicilio": "Mexicali, B.C."
          }
        ],
        "totalEventos": 22
      },
      "GUANAJUATO": {
        "display": "Guanajuato",
        "clubes": [
          {
            "club": "Club Cinegetico Penjamense \"Halcones\".",
            "domicilio": "Pénjamo, Gto."
          },
          {
            "club": "Club Cinegético del Bajío, A.C.",
            "domicilio": "León, Gto."
          }
        ],
        "totalEventos": 11
      },
      "ZACATECAS": {
        "display": "Zacatecas",
        "clubes": [
          {
            "club": "Club Cinegetico Zacatecas de Caza, Tiro y Pesca., A.C.",
            "domicilio": "Zacatecas, Zac."
          }
        ],
        "totalEventos": 2
      },
      "SINALOA": {
        "display": "Sinaloa",
        "clubes": [
          {
            "club": "Club de Caza y Pesca de Sinaloa, A.C.",
            "domicilio": "Culiacan, Sin."
          },
          {
            "club": "Club Cazadores de Mazatlan, A.C.",
            "domicilio": "Mazatlan, Sinaloa"
          }
        ],
        "totalEventos": 22
      },
      "NUEVO LEÓN": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Asoc. Regiomontana de Caza y Tiro, A.C.",
            "domicilio": "Santa Catarina, N.L."
          }
        ],
        "totalEventos": 1
      },
      "CHIHUAHUA": {
        "display": "Chihuahua",
        "clubes": [
          {
            "club": "Club de Tiradores y Cazadores Cruz Blanca A.C.",
            "domicilio": "Cd Juarez, Chih"
          },
          {
            "club": "Club 30-06 Cazadores De Chihuahua “José Seijas Caro”, A. C.",
            "domicilio": "Chihuahua, chihuahua"
          },
          {
            "club": "Club Cinegético de C.T. Y P. de Riva Palacio, A.C.",
            "domicilio": "Ojo de la llegua, Chih"
          },
          {
            "club": "Club de Caza, Tiro y Pesca Paquime, A.C.",
            "domicilio": "Nvo Casas Grandes, Chihuahua"
          },
          {
            "club": "Club Cinegético El Ganso, A.C.",
            "domicilio": "Cuauhtemoc, Chihuahua"
          }
        ],
        "totalEventos": 6
      },
      "TAMAULIPAS": {
        "display": "Tamaulipas",
        "clubes": [
          {
            "club": "Club Cinegetico Nuevo Laredo A.C",
            "domicilio": "Nuevo Laredo, Tamaulipas"
          },
          {
            "club": "Club Dptvo. Reynosa, A.C.",
            "domicilio": "Cd. Reynosa, Tamps."
          }
        ],
        "totalEventos": 9
      },
      "QUERETARO": {
        "display": "Querétaro",
        "clubes": [
          {
            "club": "Club De Tiro Queretaro, A. C.",
            "domicilio": "Queretaro, Qro."
          }
        ],
        "totalEventos": 3
      },
      "NAYARIT": {
        "display": "Nayarit",
        "clubes": [
          {
            "club": "Club Cinegético de Tepic, A.C.",
            "domicilio": "Santa Maria del Oro, Nayarit"
          }
        ],
        "totalEventos": 1
      },
      "DEFINIR": {
        "display": "Definir",
        "clubes": [
          {
            "club": "Campeonato Nacional previo a los JCC 2026",
            "domicilio": "Por definir"
          }
        ],
        "totalEventos": 1
      }
    },
    "totalEstados": 15,
    "totalEventos": 449
  },
  "SILUETAS METALICAS": {
    "tipoArma": "Rifle/Pistola",
    "calibres": ".22, .223, Alto Poder, 4.5mm",
    "estados": {
      "GUANAJUATO": {
        "display": "Guanajuato",
        "clubes": [
          {
            "club": "Club Cinegético del Bajío, A.C.",
            "domicilio": "León, Gto."
          },
          {
            "club": "Club Cinegetico Penjamense \"Halcones\".",
            "domicilio": "Pénjamo, Gto."
          }
        ],
        "totalEventos": 6
      },
      "SAN LUIS POTOSI": {
        "display": "San Luis Potosí",
        "clubes": [
          {
            "club": "Club Cinegético y de Tiro “Águilas del Fraile”, A.C.",
            "domicilio": "Villa de La Paz, S.L.P."
          },
          {
            "club": "Club Cinegético y de Tiro Halcones, A.C.",
            "domicilio": "El Tepetate"
          },
          {
            "club": "Club de Caza Tiro y Pesca Jaguares de Rioverde, A.C.",
            "domicilio": "Rioverde S.L.P. Carretera Rioverde Valles Km.6"
          },
          {
            "club": "Club Cinegético Los Condores Potosinos, A.C.",
            "domicilio": "San Luis Potosí, S.L.P."
          }
        ],
        "totalEventos": 79
      },
      "JALISCO": {
        "display": "Jalisco",
        "clubes": [
          {
            "club": "Club Alianza de Cazadores Diana A.C.",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Club Cazadores de Tepatitlan, A.C. Practica Abierta",
            "domicilio": "Tepatitlan de Morelos, Jal."
          },
          {
            "club": "Club Cinegetico Tigres De San Juan , A.C.",
            "domicilio": "SAN JUAN DE LOS LAGOS"
          },
          {
            "club": "Club Cinegético Gavilanes de Mascota, A.C.",
            "domicilio": "Mascota, Jal."
          },
          {
            "club": "Club Cinegético Nestle, A.C.",
            "domicilio": "Lagos de Moreno, Jal."
          },
          {
            "club": "Club Cazadores de Tepatitlan, A.C.",
            "domicilio": "Tepatitlan de Morelos, Jal."
          },
          {
            "club": "Club Cinegético Jalisciense, A.C.",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Club Cazadores de Tepatitlan, A.C. Borrego en movimiento",
            "domicilio": "Tepatitlan de Morelos, Jal."
          },
          {
            "club": "Club Cazadores de Tepatitlan, A.C. Practica abierta",
            "domicilio": "Tepatitlan de Morelos, Jal."
          },
          {
            "club": "Club Cinegético Celanese, A.C.",
            "domicilio": "Ocotlán, Jal."
          }
        ],
        "totalEventos": 141
      },
      "CHIAPAS": {
        "display": "Chiapas",
        "clubes": [
          {
            "club": "Club De Tiro Chiapas A.C.",
            "domicilio": "Tuxtla Gtz.Chis"
          }
        ],
        "totalEventos": 7
      },
      "MÉX": {
        "display": "Méx",
        "clubes": [
          {
            "club": "Club de Caza, Tiro, Arqueria y Pesca, \"Aguilas de Atlacomulco, A.C.",
            "domicilio": "Atlacomulco, Méx."
          }
        ],
        "totalEventos": 26
      },
      "GUERRERO": {
        "display": "Guerrero",
        "clubes": [
          {
            "club": "Club de C. T. y P. Chilpancingo, A.C.",
            "domicilio": "CHILPANCINGO"
          },
          {
            "club": "Club de C. T. y P. de Acapulco, A.C.",
            "domicilio": "Acapulco, Gro."
          },
          {
            "club": "Club de Caza y Tiro \"El Huixteco\"",
            "domicilio": "Taxco, Gro."
          },
          {
            "club": "Club Union de Cazadores del Sur, A.C.",
            "domicilio": "Iguala, Gro."
          },
          {
            "club": "Club de C. T. y P. Rio Grande, A.C.",
            "domicilio": "San Luis la Loma, Gro."
          }
        ],
        "totalEventos": 55
      },
      "MEXICO": {
        "display": "Estado de México",
        "clubes": [
          {
            "club": "Club Ferrocarrileros del Valle de México, A.C.",
            "domicilio": "Pueblo San Marcos Tecomaxusco, Ecatzingo Edo. Mex."
          }
        ],
        "totalEventos": 4
      },
      "COAHUILA": {
        "display": "Coahuila",
        "clubes": [
          {
            "club": "club campestre de caza tiro y pesca de acuña a.c.",
            "domicilio": "cd. acuña coah."
          },
          {
            "club": "Club Cinegetico Saltillo Safari AC",
            "domicilio": "SALTILLO, COAHUILA"
          },
          {
            "club": "Club Cinegético y de Tiro de Coahuila, A.C.",
            "domicilio": "Saltillo, Coah."
          },
          {
            "club": "Club Deportivo de Cazadores \"Francisco I. Madero  A.C.",
            "domicilio": "Parras, Coah."
          },
          {
            "club": "Club Cinégetico del Valle de Saltillo, A.C.",
            "domicilio": "Saltillo, Coah."
          }
        ],
        "totalEventos": 87
      },
      "NUEVO LEON": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Rifle y Caña de Nuevo Leon, A.C.D.",
            "domicilio": "Garcia, N.L."
          }
        ],
        "totalEventos": 6
      },
      "PUEBLA": {
        "display": "Puebla",
        "clubes": [
          {
            "club": "Club Caza Dptva. El Aguila, A.C.",
            "domicilio": "Pixtla, Pue."
          }
        ],
        "totalEventos": 9
      },
      "VERACRUZ": {
        "display": "Veracruz",
        "clubes": [
          {
            "club": "Club de Caza, Tiro y Pesca \" La Jauría \" A.C.",
            "domicilio": "Martínez de la Torre, Ver."
          }
        ],
        "totalEventos": 1
      },
      "SONORA": {
        "display": "Sonora",
        "clubes": [
          {
            "club": "CLUB DE TIRO Y CAZA CANANEA A.C.",
            "domicilio": "Cananea, Son."
          },
          {
            "club": "CLUB DEPORTIVO HERMOSILLENSE DE CAZA Y TIRO, A.C.",
            "domicilio": "Hermosillo, Son."
          },
          {
            "club": "Club Norteño de C. T. y P., A.C.",
            "domicilio": "Nogales, Son."
          },
          {
            "club": "Club deTiro, Caza y Tiro Agua Prieta, A. C.",
            "domicilio": "Agua Prieta, Sonora"
          },
          {
            "club": "Club Cinegético Lobos de Nogales, A.C.",
            "domicilio": "Nogales, Son."
          },
          {
            "club": "Club Cazadores y Tiradores Nogalenses, A.C.",
            "domicilio": "Nogales, Son."
          }
        ],
        "totalEventos": 168
      },
      "SINALOA": {
        "display": "Sinaloa",
        "clubes": [
          {
            "club": "Club de Tiro, Caza y Pesca Lic. Miguel Aleman A.C.",
            "domicilio": "Culiacán, Sin."
          },
          {
            "club": "Club de Caza y Pesca de Sinaloa, A.C.",
            "domicilio": "Culiacán,Sinaloa."
          },
          {
            "club": "Club Cazadores de Mazatlan, A.C.",
            "domicilio": "Mazatlan , Sin"
          }
        ],
        "totalEventos": 65
      },
      "NUEVO LEÓN": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Asoc. Regiomontana de Caza y Tiro, A.C.",
            "domicilio": "Santa Catarina, N.L."
          },
          {
            "club": "Club de Caza Tiro y Pesca San Nicolas de los Garza, A.C.  ANIVERSARIO DEL CLUB",
            "domicilio": "Escobedo, Nuevo León"
          },
          {
            "club": "Club de Caza Tiro y Pesca San Nicolas de los Garza, A.C.",
            "domicilio": "Escobedo, Nuevo León"
          }
        ],
        "totalEventos": 22
      },
      "MICHOACAN": {
        "display": "Michoacán",
        "clubes": [
          {
            "club": "Club Cinegético Arteaga, A.C.",
            "domicilio": "Arteaga, Mich."
          },
          {
            "club": "Club Cinegético Morelos, A.C.",
            "domicilio": "Uruapan, Mich."
          }
        ],
        "totalEventos": 12
      },
      "TAMAULIPAS": {
        "display": "Tamaulipas",
        "clubes": [
          {
            "club": "Club Dptvo. Reynosa, A.C.",
            "domicilio": "Cd. Reynosa, Tamps."
          },
          {
            "club": "Club Cinegetico Nuevo Laredo A.C",
            "domicilio": "Nuevo Laredo, Tamaulipas"
          }
        ],
        "totalEventos": 12
      },
      "BAJA CALIFORNIA": {
        "display": "Baja California",
        "clubes": [
          {
            "club": "Club C. T. y P. Berrendo, A.C.",
            "domicilio": "Tijuana, B.C."
          },
          {
            "club": "Club Dptvo. Zafari de el Sauzal, A.C.",
            "domicilio": "Ensenada, B.C."
          },
          {
            "club": "Club C T. y P. Guadalupe Victoria, A.C.",
            "domicilio": "Mexicali, B.C."
          },
          {
            "club": "Club Dptvo. de C. T. y P. El Venado, A.C.",
            "domicilio": "Mexicali, B.C."
          },
          {
            "club": "Club Tiro y Caza 30-30, A.C.",
            "domicilio": "Ensenada, B.C."
          },
          {
            "club": "Club Cinegético Jabalí, A.C.",
            "domicilio": "Mexicali, B.C."
          },
          {
            "club": "Club Tiro y Caza Panteras, A.C.",
            "domicilio": "Ensenada, B.C."
          },
          {
            "club": "Club T. C. y P. Cimarrones, A.C.",
            "domicilio": "Mexicali, B.C."
          }
        ],
        "totalEventos": 26
      },
      "BAJA CALIFORNIA SUR": {
        "display": "Baja California Sur",
        "clubes": [
          {
            "club": "Club Club de Caza Tiro Y pesca del valle de santo Domingo AC.",
            "domicilio": "Cd. Constitucion, BCS."
          },
          {
            "club": "Club de T. C. y P. Choyeros, A.C.",
            "domicilio": "CABO SAN LUCAS"
          }
        ],
        "totalEventos": 19
      },
      "NAYARIT": {
        "display": "Nayarit",
        "clubes": [
          {
            "club": "Club Cinegetico Prisciliano Sanchez. A.C.",
            "domicilio": "Ahuacatlan, Nay."
          },
          {
            "club": "Club Cinegético de Tepic, A.C.",
            "domicilio": "Santa Maria del Oro, Nayarit"
          }
        ],
        "totalEventos": 7
      },
      "CHIHUAHUA": {
        "display": "Chihuahua",
        "clubes": [
          {
            "club": "Club de Caza, Tiro  y Pesca El Crustáceo.",
            "domicilio": "Rosales, Chihuahua"
          },
          {
            "club": "Club Cinegético El Ganso, A.C",
            "domicilio": "Cuauhtemoc Chihuahua"
          },
          {
            "club": "Club Deportivo de C.T. Y P. Cuauhtémoc, A.C.",
            "domicilio": "Cuauhtemoc Chihuahua"
          },
          {
            "club": "Club de Tiradores y Cazadores Cruz Blanca A.C.",
            "domicilio": "Cd, Juarez, Chih."
          },
          {
            "club": "Club Deportivo de Tiro, Caza y Pesca de CD. Juárez.",
            "domicilio": "Juarez, Chihuahua"
          },
          {
            "club": "Club Deportivo Cuauhtemoc",
            "domicilio": "Cuauhtemoc Chihuahua"
          }
        ],
        "totalEventos": 9
      },
      "QUERETARO": {
        "display": "Querétaro",
        "clubes": [
          {
            "club": "Club de Caza, Tiro y Pesca Los Gamitos A.C.",
            "domicilio": "Querétaro, Mex."
          },
          {
            "club": "Club de Caza y Tiro Cristóbal Colón, A.C.",
            "domicilio": "Colón, Qro."
          },
          {
            "club": "Club De Tiro Queretaro, A. C.",
            "domicilio": "Queretaro, Qro."
          }
        ],
        "totalEventos": 11
      },
      "ZACATECAS": {
        "display": "Zacatecas",
        "clubes": [
          {
            "club": "Club Lobos de Zacatecas, A.C.",
            "domicilio": "Zacatecas, Zac."
          },
          {
            "club": "Club Cinegetico Zacatecas de Caza, Tiro y Pesca., A.C.",
            "domicilio": "Zacatecas, Zac."
          }
        ],
        "totalEventos": 6
      },
      "DURANGO": {
        "display": "Durango",
        "clubes": [
          {
            "club": "Asociacion lagunera de Tiro y Caza A.C.",
            "domicilio": "Gomez palacio, Durango"
          }
        ],
        "totalEventos": 1
      },
      "OAXACA": {
        "display": "Oaxaca",
        "clubes": [
          {
            "club": "Club de C. T. y P. Flechador del Sol, A.C.",
            "domicilio": "Huajapan de León, Oax"
          }
        ],
        "totalEventos": 3
      },
      "AGUASCALIENTES": {
        "display": "Aguascalientes",
        "clubes": [
          {
            "club": "Club de Tiro y Cinegético Esparta, A.C.",
            "domicilio": "Aguascalientes, Ags"
          }
        ],
        "totalEventos": 5
      },
      "TABASCO": {
        "display": "Tabasco",
        "clubes": [
          {
            "club": "Club Cinegético de Caza, Tiro y Pesca el Tigre, A.C.",
            "domicilio": "Villahermosa, Tabasco"
          }
        ],
        "totalEventos": 4
      }
    },
    "totalEstados": 26,
    "totalEventos": 937
  },
  "TIRO PRACTICO": {
    "tipoArma": "Pistola/Rifle/Escopeta",
    "calibres": ".22, .38 SPL, .380, .223, 12",
    "estados": {
      "JALISCO": {
        "display": "Jalisco",
        "clubes": [
          {
            "club": "Club Cinegetico Jalisciense, A.C.",
            "domicilio": "Zapopan, Jal."
          },
          {
            "club": "Club Alianza de Cazadores Diana A.C.",
            "domicilio": "Zapopan, Jal."
          }
        ],
        "totalEventos": 208
      },
      "MORELOS": {
        "display": "Morelos",
        "clubes": [
          {
            "club": "Club Mexco de Perros de Muestra, A.C.",
            "domicilio": "Huitzilac, Mor."
          }
        ],
        "totalEventos": 50
      },
      "COAHUILA": {
        "display": "Coahuila",
        "clubes": [
          {
            "club": "Club Campestre de C.T. y P. de Cd. Acuña, A.C.",
            "domicilio": "cd. Acuña coah"
          },
          {
            "club": "Club Cinegetico Saltillo Safari AC",
            "domicilio": "Saltillo, Coah."
          },
          {
            "club": "Club Cinegético Saltillo Safari, A.C.",
            "domicilio": "Saltillo, Coah."
          }
        ],
        "totalEventos": 63
      },
      "GUERRERO": {
        "display": "Guerrero",
        "clubes": [
          {
            "club": "Club de C. T. y P. Chilpancingo, A.C.",
            "domicilio": "Chilpancingo, Gro."
          },
          {
            "club": "Club de C. T. y P. de Acapulco, A.C.",
            "domicilio": "Acapulco, Gro."
          },
          {
            "club": "Club de Caza y Tiro \"El Huixteco\", A.C.",
            "domicilio": "Taxco, Gro"
          },
          {
            "club": "Club de C. T. y P. Gacels de Guerrero, A.C.",
            "domicilio": "Acapulco, Gro."
          }
        ],
        "totalEventos": 63
      },
      "VERACRUZ": {
        "display": "Veracruz",
        "clubes": [
          {
            "club": "Club de Caza, Pesca y Tiro Jabatos A.C.",
            "domicilio": "Las Chopas, Ver."
          }
        ],
        "totalEventos": 24
      },
      "SAN LUIS POTOSI": {
        "display": "San Luis Potosí",
        "clubes": [
          {
            "club": "Club Cinegético y de Tiro Halcones, A.C.",
            "domicilio": "El Tepetate"
          }
        ],
        "totalEventos": 10
      },
      "HIDALGO": {
        "display": "Hidalgo",
        "clubes": [
          {
            "club": "Club de Caza y Pesca Sidena, A.C.",
            "domicilio": "Cd. Sahagun, Hgo."
          },
          {
            "club": "Club de Tiro, Caza y Pesca, Jaguar, A.C.",
            "domicilio": "Ocozocoautla de Espinosa, Chis."
          }
        ],
        "totalEventos": 24
      },
      "CHIAPAS": {
        "display": "Chiapas",
        "clubes": [
          {
            "club": "Club de Tiro, Caza y Pesca, Jaguar, A.C.",
            "domicilio": "Ocozocoautla de Espinosa, Chis."
          },
          {
            "club": "Club de C. T. y P. Hálcones, A.C.",
            "domicilio": "Tuxtla Gutierrez, Chis"
          },
          {
            "club": "Club de Tiro Olimpico Chiapaneco A.C.",
            "domicilio": "Berriozabal"
          }
        ],
        "totalEventos": 45
      },
      "TABASCO": {
        "display": "Tabasco",
        "clubes": [
          {
            "club": "Club de Caza, Tiro y Pesca El Tigre, A.C.",
            "domicilio": "Villahermosa, Tabasco"
          }
        ],
        "totalEventos": 12
      },
      "TAMAULIPAS": {
        "display": "Tamaulipas",
        "clubes": [
          {
            "club": "Club Dptvo. Reynosa, A.C.",
            "domicilio": "Cd. Reynosa, Tamps."
          },
          {
            "club": "Club Cinegetico Nuevo Laredo A.C",
            "domicilio": "Nuevo Laredo, Tamaulipas"
          }
        ],
        "totalEventos": 5
      },
      "MEXICO": {
        "display": "Estado de México",
        "clubes": [
          {
            "club": "Club Cinegético Jaribú, A.C.",
            "domicilio": "Jilotzingo, Mex."
          },
          {
            "club": "Club Cinegético El Sable, A.C.",
            "domicilio": "Capulhuac. Mex."
          },
          {
            "club": "Club de Tiro y Caza la Cañada, A.C.",
            "domicilio": "Jilotzingo, Estado de Mexico"
          },
          {
            "club": "Club de Tiro y Caza la Cañada, A.C,",
            "domicilio": "Jilotzingo, Estado de Mexico"
          }
        ],
        "totalEventos": 32
      },
      "MICHOACAN": {
        "display": "Michoacán",
        "clubes": [
          {
            "club": "Club Cinegético Halcones de Jacona, A.C.",
            "domicilio": "Jacona, Mich."
          },
          {
            "club": "Club Cinegético Morelia, A.C.",
            "domicilio": "Capula, Mich."
          }
        ],
        "totalEventos": 14
      },
      "SINALOA": {
        "display": "Sinaloa",
        "clubes": [
          {
            "club": "Club de Caza y Pesca de Sinaloa, A.C.",
            "domicilio": "Culiacán"
          },
          {
            "club": "Club de Tiro, Caza y Pesca Lic. Miguel Aleman, A.C.",
            "domicilio": "Culiacán, Sin."
          }
        ],
        "totalEventos": 16
      },
      "NAYARIT": {
        "display": "Nayarit",
        "clubes": [
          {
            "club": "Club Cinegético de Tepic, A.C.",
            "domicilio": "Santa Maria del Oro, Nayarit"
          }
        ],
        "totalEventos": 1
      },
      "BAJA CALIFORNIA": {
        "display": "Baja California",
        "clubes": [
          {
            "club": "Club C. T. y P. Berrendo, A.C.",
            "domicilio": "Tijuana, B.C."
          },
          {
            "club": "Club C. T, y P. Condor de Tijuana, A.C.",
            "domicilio": "Tijuana, B.C."
          },
          {
            "club": "Club Cinegético Jabalí, A.C.",
            "domicilio": "Mexicali, B.C."
          },
          {
            "club": "Club Dptvo. Zafari de el Sauzal, A.C.",
            "domicilio": "Ensenada, B.C."
          },
          {
            "club": "Club C. T y P. Berrendo, A.C.",
            "domicilio": "Tijuana, B.C."
          }
        ],
        "totalEventos": 25
      },
      "NUEVO LEON": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club Rifle y Caña de Nuevo Leon, A.C.D.",
            "domicilio": "Garcia, N.L."
          },
          {
            "club": "Club Asoc. Regiomontana de Caza y Tiro, A.C.",
            "domicilio": "Santa Catarina, N.L"
          }
        ],
        "totalEventos": 12
      },
      "YUCATÁN": {
        "display": "Yucatán",
        "clubes": [
          {
            "club": "Club de Caza, Tiro y Pesca de Yucatán A.C.",
            "domicilio": "Mérida, Yucatán"
          }
        ],
        "totalEventos": 7
      },
      "NUEVO LEÓN": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Club de Caza Tiro y Pesca San Nicolas de los Garza, A.C.",
            "domicilio": "Escobedo, Nuevo León"
          }
        ],
        "totalEventos": 3
      },
      "GUANAJUATO": {
        "display": "Guanajuato",
        "clubes": [
          {
            "club": "Club Cinegetico Penjamense \"Halcones\", A.C.",
            "domicilio": "Pénjamo, Gto."
          }
        ],
        "totalEventos": 1
      }
    },
    "totalEstados": 19,
    "totalEventos": 615
  },
  "TIRO NEUMATICO": {
    "tipoArma": "Rifle/Pistola de Aire",
    "calibres": "4.5mm, 5.5mm",
    "estados": {
      "JALISCO": {
        "display": "Jalisco",
        "clubes": [
          {
            "club": "Club Cinegético Jalisciense, A.C.",
            "domicilio": "Zapopan, Jal."
          }
        ],
        "totalEventos": 2
      },
      "BAJA CALIFORNIA": {
        "display": "Baja California",
        "clubes": [
          {
            "club": "Club Dptvo. Zafari de el Sauzal, A.C.",
            "domicilio": "Ensenada, B.C."
          }
        ],
        "totalEventos": 4
      },
      "SONORA": {
        "display": "Sonora",
        "clubes": [
          {
            "club": "Club Dptvo. Hermosillense de C. y T., A.C.",
            "domicilio": "Hermosillo Son."
          }
        ],
        "totalEventos": 1
      },
      "SAN LUIS POTOSI": {
        "display": "San Luis Potosí",
        "clubes": [
          {
            "club": "Club Cinegético y de Tiro Halcones",
            "domicilio": "San Luis Potosí, S.L.P."
          }
        ],
        "totalEventos": 1
      },
      "NUEVO LEON": {
        "display": "Nuevo León",
        "clubes": [
          {
            "club": "Campeonato Nacional FEMETI / AMTA",
            "domicilio": "Monterrey, N.L"
          }
        ],
        "totalEventos": 1
      }
    },
    "totalEstados": 5,
    "totalEventos": 9
  }
};

/**
 * Obtiene los estados disponibles para una modalidad
 */
export const getEstadosPorModalidad = (modalidad) => {
  const data = MODALIDADES_FEMETI_2026[modalidad];
  if (!data) return [];
  return Object.keys(data.estados).sort();
};

/**
 * Obtiene todos los clubes de un estado para una modalidad específica
 */
export const getClubesPorEstadoYModalidad = (modalidad, estado) => {
  const data = MODALIDADES_FEMETI_2026[modalidad];
  if (!data || !data.estados[estado]) return [];
  return data.estados[estado].clubes;
};

/**
 * Genera la matriz de clubes para el PDF siguiendo formato RFA-LC-017
 * @param {string} modalidad - Modalidad seleccionada
 * @param {string[]} estadosSeleccionados - Array de estados
 * @param {string} fechaSolicitud - Fecha de solicitud del PETA
 * @returns {Object} Datos para generar la tabla en el PDF
 */
export const generarMatrizClubesPDF = (modalidad, estadosSeleccionados, fechaSolicitud) => {
  const temporalidad = calcularTemporalidad(fechaSolicitud);
  const data = MODALIDADES_FEMETI_2026[modalidad];
  
  if (!data) return null;
  
  const filas = [];
  let contador = 1;
  
  for (const estado of estadosSeleccionados) {
    const estadoData = data.estados[estado];
    if (!estadoData) continue;
    
    for (const clubInfo of estadoData.clubes) {
      filas.push({
        numero: contador++,
        estado: estadoData.display,
        club: clubInfo.club,
        temporalidad: temporalidad.textoCompleto,
        domicilio: clubInfo.domicilio
      });
    }
  }
  
  return {
    modalidad,
    tipoArma: data.tipoArma,
    calibres: data.calibres,
    temporalidad,
    filas,
    totalClubes: filas.length
  };
};

/**
 * Lista de modalidades disponibles con iconos
 */
export const LISTA_MODALIDADES = [
  { key: 'TIRO PRACTICO', nombre: 'Tiro Práctico', icono: '⚡', arma: 'Pistola/Rifle/Escopeta' },
  { key: 'RECORRIDOS DE CAZA', nombre: 'Recorridos de Caza', icono: '🎯', arma: 'Escopeta' },
  { key: 'TIRO OLIMPICO', nombre: 'Tiro Olímpico', icono: '🏅', arma: 'Escopeta' },
  { key: 'BLANCOS EN MOVIMIENTO', nombre: 'Blancos en Movimiento', icono: '🕊️', arma: 'Escopeta' },
  { key: 'SILUETAS METALICAS', nombre: 'Siluetas Metálicas', icono: '🔫', arma: 'Rifle/Pistola' },
  { key: 'TIRO NEUMATICO', nombre: 'Tiro Neumático', icono: '💨', arma: 'Aire' }
];

export default MODALIDADES_FEMETI_2026;
