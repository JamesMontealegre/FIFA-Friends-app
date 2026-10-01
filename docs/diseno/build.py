#!/usr/bin/env python3
"""
Compilador del Documento de Diseño (HTML paginado -> PDF).

Uso:
    python3 build.py            # compila y reporta páginas
    python3 build.py --rapido   # omite índices de figuras/tablas (iteración rápida)

El documento se ensambla a partir del manifiesto MANIFIESTO, en orden.
Los índices (contenido, figuras, tablas) se generan automáticamente a partir
de los encabezados y leyendas con atributo id.
"""
import os
import re
import sys
import html

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "src")
OUT = os.path.join(BASE, "build")
PDF = os.path.join(BASE, "Documento-Diseno-UI-UX-FIFA-Friends.pdf")

MANIFIESTO = [
    "00-portada.html",
    "00b-control.html",
    "00c-resumen.html",
    "__TOC__",
    "__IDXFIG__",
    "p1-portadilla.html",
    "01-introduccion.html",
    "02-marco-normativo.html",
    "03-proceso-hcd.html",
    "04-principios.html",
    "p2-portadilla.html",
    "05-color-teoria.html",
    "06-color-sistema.html",
    "07-tipografia.html",
    "08-reticula-espacio.html",
    "p3-portadilla.html",
    "09-arquitectura-informacion.html",
    "10-distribucion-componentes.html",
    "11-maestro-detalle.html",
    "12-catalogo-componentes.html",
    "13-patrones-interaccion.html",
    "p4-portadilla.html",
    "14-arquitectura-spa.html",
    "15-estado-datos.html",
    "16-modelo-dominio.html",
    "17-spa-accesible.html",
    "p5-portadilla.html",
    "18-accesibilidad.html",
    "19-accesibilidad-operativa.html",
    "p6-portadilla.html",
    "20-modelo-amenazas.html",
    "21-seguridad-frontend.html",
    "22-identidad-autorizacion.html",
    "23-cadena-suministro.html",
    "p7-portadilla.html",
    "24-rendimiento.html",
    "25-rendimiento-operacion.html",
    "26-calidad-pruebas.html",
    "27-gobernanza.html",
    "p8-portadilla.html",
    "a-tokens.html",
    "b-checklist-wcag.html",
    "c-checklist-seguridad.html",
    "d-checklist-rendimiento.html",
    "e-patrones-aria.html",
    "f-trazabilidad.html",
    "g-plantillas.html",
    "h-adr.html",
    "i-glosario.html",
    "j-bibliografia.html",
]

H_RE = re.compile(r'<h([123])\s+id="([^"]+)"[^>]*>(.*?)</h\1>', re.S)
PARTE_RE = re.compile(r'<section class="parte"[^>]*>(.*?)</section>', re.S)
FIG_RE = re.compile(r'<figure id="([^"]+)"[^>]*>.*?<figcaption>\s*<b>(.*?)</b>(.*?)</figcaption>', re.S)
TAB_RE = re.compile(r'id="(t[^"]+)"[^>]*>.*?<(?:caption|p) class="tcap"[^>]*>\s*<b>(.*?)</b>(.*?)</(?:caption|p)>', re.S)


def limpio(t: str) -> str:
    t = re.sub(r'<span class="cnum">.*?</span>', '', t, flags=re.S)
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()


WRAP_RE = re.compile(r'(<h1 id="[^"]+"><span class="cnum">[^<]*</span>)(.*?)(</h1>)', re.S)


def envolver_titulo(txt: str) -> str:
    """Aisla el título del capítulo en un <span> para el encabezado vivo."""
    return WRAP_RE.sub(lambda m: f'{m.group(1)}<span class="ctit">{m.group(2)}</span>{m.group(3)}', txt)


def leer(nombre: str) -> str:
    ruta = os.path.join(SRC, nombre)
    if not os.path.exists(ruta):
        sys.stderr.write(f"  [falta] {nombre}\n")
        return ""
    with open(ruta, encoding="utf-8") as fh:
        return envolver_titulo(fh.read())


def construir_toc(cuerpos):
    filas = []
    for nombre, txt in cuerpos:
        if 'class="parte"' in txt:
            m = re.search(r'<section class="parte" id="([^"]+)"', txt)
            h = re.search(r'<h1[^>]*>(.*?)</h1>', txt, re.S)
            et = re.search(r'<p class="et">(.*?)</p>', txt, re.S)
            if m and h:
                rot = limpio(et.group(1)) + " — " + limpio(h.group(1)) if et else limpio(h.group(1))
                filas.append(("pt", m.group(1), rot))
            continue
        for niv, ident, texto in H_RE.findall(txt):
            if niv == "3":
                continue
            rot = limpio(texto)
            if niv == "1":
                num = re.search(r'<span class="cnum">([^<]+)</span>', texto)
                if num:
                    etiqueta = limpio(num.group(1))
                    corto = etiqueta.replace("Capítulo ", "").replace("Apéndice ", "")
                    rot = f"{corto} · {rot}"
            filas.append((f"n{niv}", ident, rot))
    li = []
    for clase, ident, texto in filas:
        c = "n1 pt" if clase == "pt" else clase
        li.append(f'<li class="{c}"><a href="#{ident}">{html.escape(texto)}</a></li>')
    return ('<section class="liminar toc" id="toc"><h1>Índice de contenido</h1>\n<ul>\n'
            + "\n".join(li) + "\n</ul>\n</section>\n")


def construir_indices(cuerpos):
    figs, tabs = [], []
    for _, txt in cuerpos:
        for ident, et, resto in FIG_RE.findall(txt):
            figs.append((ident, limpio(et), limpio(resto)))
        for ident, et, resto in TAB_RE.findall(txt):
            tabs.append((ident, limpio(et), limpio(resto)))
    def bloque(items, titulo, ident_sec):
        if not items:
            return ""
        li = []
        for i, e, r in items:
            r = re.sub(r'^\s*[—–-]\s*', '', r)
            if len(r) > 104:
                r = r[:104].rsplit(' ', 1)[0].rstrip(' ,;:.') + '…'
            li.append(f'<li class="n2"><a href="#{i}">{html.escape(e)} — {html.escape(r)}</a></li>')
        return (f'<section class="liminar toc" id="{ident_sec}"><h1>{titulo}</h1>\n<ul>\n'
                + "\n".join(li) + "\n</ul>\n</section>\n")
    return bloque(figs, "Índice de figuras", "idxfig") + bloque(tabs, "Índice de tablas", "idxtab")


def main():
    rapido = "--rapido" in sys.argv
    os.makedirs(OUT, exist_ok=True)
    cuerpos = [(n, leer(n)) for n in MANIFIESTO if not n.startswith("__")]
    partes = []
    for nombre in MANIFIESTO:
        if nombre == "__TOC__":
            partes.append(construir_toc(cuerpos))
        elif nombre == "__IDXFIG__":
            partes.append("" if rapido else construir_indices(cuerpos))
        else:
            partes.append(dict(cuerpos).get(nombre, ""))
    doc = (
        '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n'
        '<title>Documento de Diseño de Interfaz, Accesibilidad, Seguridad y '
        'Rendimiento — Plataforma FIFA Friends</title>\n'
        '<meta name="author" content="Unidad de Arquitectura de Experiencia Digital y Front-End">\n'
        '<meta name="description" content="Especificación integral de experiencia de usuario, '
        'sistema visual, accesibilidad WCAG 2.2 AA, seguridad, rendimiento, patrón maestro-detalle '
        'y arquitectura de aplicación de página única.">\n'
        '<meta name="keywords" content="diseño de interfaces, UI, UX, teoría del color, tipografía, '
        'accesibilidad, WCAG 2.2, seguridad web, OWASP, rendimiento, Core Web Vitals, maestro-detalle, '
        'SPA, sistema de diseño, tokens">\n'
        '<meta name="dcterms.created" content="2026-10-01">\n'
        '<link rel="stylesheet" href="../assets/doc.css">\n</head>\n<body>\n'
        + "\n".join(partes) + "\n</body>\n</html>\n"
    )
    ruta_html = os.path.join(OUT, "documento.html")
    with open(ruta_html, "w", encoding="utf-8") as fh:
        fh.write(doc)

    from weasyprint import HTML
    documento = HTML(filename=ruta_html).render()
    documento.write_pdf(PDF)
    palabras = len(re.findall(r'\S+', re.sub(r'<[^>]+>', ' ', doc)))
    print(f"PDF:      {PDF}")
    print(f"Páginas:  {len(documento.pages)}")
    print(f"Palabras: ~{palabras:,}")
    print(f"Tamaño:   {os.path.getsize(PDF)/1024:.0f} KB")


if __name__ == "__main__":
    main()
