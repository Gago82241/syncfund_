# Capturas del antes

La interfaz de SyncFund antes del rediseño, en escritorio y en iPhone 16. Hay dos juegos:

| Carpeta | Qué tiene | Datos |
| --- | --- | --- |
| Esta carpeta (originales) | 6 pantallas: Billetera, Proyectos, Detalle del proyecto (`projects_40`), Categorías, Login y Registro. Falta el Resumen. | Base de datos local de un integrante del equipo, en la fecha del diagnóstico (2026-11-13). |
| [`simuladas/`](simuladas/) | Las 7 pantallas, incluido el Resumen. | La misma API simulada de [`../capturas-despues/`](../capturas-despues/). |

Para comparar antes y después, conviene usar `simuladas/` contra `capturas-despues/`: tienen los
mismos datos, los mismos tamaños y los mismos nombres de archivo. Las originales se conservan como
evidencia del diagnóstico de [`../critica.md`](../critica.md).

## Originales

- Tomadas con las herramientas de desarrollo de Chrome. Las de escritorio son recortes de la
  columna central de 640 px (unos 663 px de ancho), no de la ventana completa.
- Las de iPhone 16 miden 1179 px de ancho en Login y Registro, y 1974 px en las demás: esas
  páginas se desbordaban a lo ancho en el celular (uno de los problemas del diagnóstico).

## Simuladas

- **Versión:** commit `52fa842` (PR #26), el último antes del rediseño (PR #27). Se levantó en un
  `git worktree` aparte, sin tocar la rama de trabajo, con el frontend apuntando a la API
  simulada. No se usó ninguna base de datos.
- **Datos:** los mismos de `capturas-despues/` (Diego, con $ 1.234.000 disponibles, una deuda de
  $ 100.000 con Laura Gómez en "Arriendo apartamento", 4 proyectos y 5 categorías). La API
  simulada responde también los tres endpoints que solo usaba esta versión (saldo general,
  categoría excedida y deuda por integrante), con la misma lógica del backend.
- **Tamaños:** escritorio a 1440 × 900 px, escala 1; iPhone 16 a 393 × 852 px, escala 3. Ambos de
  página completa y con "reducir movimiento".
- En el iPhone, las pantallas con sesión salen de 1953 px de ancho (651 px × 3): la página antigua
  se desborda a lo ancho, igual que en las originales.
