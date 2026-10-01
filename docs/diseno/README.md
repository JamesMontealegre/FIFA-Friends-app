# Documento de Diseño — FIFA Friends

Entregable: **`Documento-Diseno-UI-UX-FIFA-Friends.pdf`** (193 páginas, A4).

Especificación integral de diseño de interfaz, teoría del color y tipografía,
accesibilidad (WCAG 2.2 AA), seguridad, rendimiento, patrón maestro–detalle,
arquitectura de aplicación de página única y distribución de componentes.

## Estructura de las fuentes

- `src/` — un fichero HTML por capítulo y apéndice, en el orden del manifiesto de `build.py`.
- `assets/doc.css` — hoja de estilos de impresión (CSS Paged Media).
- `build.py` — compilador: ensambla las fuentes, genera índice de contenido,
  de figuras y de tablas con números de página reales, y produce el PDF.

## Recompilar

```sh
pip install weasyprint
python3 build.py            # compila el PDF completo
python3 build.py --rapido   # omite los índices de figuras y tablas (iteración rápida)
```

El script imprime la ruta del PDF, el número de páginas y el recuento de palabras.
Los índices y las referencias de página se calculan automáticamente: no se editan a mano.
