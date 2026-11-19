# Capturas del después

Las 7 pantallas de SyncFund al terminar el rediseño (commit `3211070`, PR #35), en escritorio y en
iPhone 16. Sirven para compararlas con [`../capturas-antes/simuladas/`](../capturas-antes/simuladas/),
que tiene las mismas pantallas, con los mismos datos y los mismos nombres de archivo, antes del
rediseño.

| Pantalla | Escritorio | iPhone 16 |
| --- | --- | --- |
| Resumen | `localhost_5173_dashboard.png` | `localhost_5173_dashboard(iPhone 16).png` |
| Billetera personal | `localhost_5173_wallet.png` | `localhost_5173_wallet(iPhone 16).png` |
| Proyectos compartidos | `localhost_5173_projects.png` | `localhost_5173_projects(iPhone 16).png` |
| Detalle del proyecto | `localhost_5173_projects_40.png` | `localhost_5173_projects_40(iPhone 16).png` |
| Categorías | `localhost_5173_categories.png` | `localhost_5173_categories(iPhone 16).png` |
| Login | `localhost_5173_login.png` | `localhost_5173_login(iPhone 16).png` |
| Registro | `localhost_5173_register.png` | `localhost_5173_register(iPhone 16).png` |

## Cómo se generaron

- **Datos:** una API simulada (no se versiona) con un usuario de ejemplo, Diego, que tiene
  $ 1.234.000 disponibles y $ 200.000 en el colchón, 4 proyectos (en "Arriendo apartamento" le
  debe $ 100.000 a Laura Gómez) y 5 categorías, dos cerca del límite y una pasada. No se usó
  ninguna base de datos real. El proyecto del Detalle se numeró 40 para conservar el nombre de
  archivo de las capturas originales.
- **Escritorio:** Chrome sin interfaz a 1440 × 900 px, escala 1, página completa.
- **iPhone 16:** 393 × 852 px, escala 3 (1179 px de ancho), modo táctil, página completa.
- Con "reducir movimiento" activado, para que ninguna animación quede a medias.
- Los nombres llevan `localhost_5173` para coincidir con las capturas originales, aunque se
  tomaron con el servidor de desarrollo en otro puerto.
