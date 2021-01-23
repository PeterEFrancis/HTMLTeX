# HTMLTeX

This is a CSS+JS tool for making HTML look like LaTeX.

**See a live [Example](https://peterefrancis.com/HTMLTeX/examples/) here.**

Dependencies:
 - Bootstap (and jQuery)
 - MathJax

## Usage

Include the following in the head of your HTML doc:

```HTML
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- Bootstrap -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

<!-- MathJax -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML"></script>

<!-- HTMLTeX -->
<script src="https://cdn.jsdelivr.net/gh/PeterEFrancis/HTMLTeX/HTMLTeX.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/PeterEFrancis/HTMLTeX/HTMLTeX.min.css">
```

Create an element in the body of the HTML doc that you would like to make look like LaTeX. Then include this script at the bottom of the page. Make sure the first argument to the `HTMLTeX` constructor is your intended LaTeX element.

```HTML
<script type="text/x-mathjax-config">
  new HTMLTeX(document.getElementById('LaTeX'), MathJax).render();
</script>
```

`render()` can take an optional JSON with the following optional keys:
  - `highlight_links`: (true|false)
    - Set to true for cyan outlines of links

## New and modified HTML Tags for use

The benefit of **HTMLTeX** is the easy use of new and modified HTML tags. The list below describes the possible tag attributes and their purpose.

#### New Tags

- `<tableofcontents>` display the table of contents (sections)
- `<section>` create section header
  - **id**: unique ID for use of on-page refs links
- `<definition>` definition environment
  - **id**: unique ID for use of on-page refs links
- `<lemma>` lemma environment
  - **id**: unique ID for use of on-page refs links
- `<theorem>` theorem environment
  - **id**: unique ID for use of on-page refs links
- `<proof>` proof environment
  - **collapse**: (true|false) set mode of proof box to be collapsable or not
  - **open**: (true|false) set default mode for collapsable proof box to be open
- `<ref>` in-page reference link
  - **to**: id of referenced tag
- `<cite>` in-page citation link
  - **to**: id of referenced references item
- `<references>` references section
- `<item>` reference in the references section
  - **id**: unique ID for use of on-page cite links


#### Modified Tags

- `<br>` line break (extra line)
- `<table>`
  - **id**: unique ID for use of on-page refs links
  - **caption**: Custom Table Caption
