
"use strict";


const labeled_blocks_tag_types = [
  'DEFINITION',
  'THEOREM',
  'LEMMA',
];



class HTMLTeX {

  constructor(container, MathJax) {
    this.container = container;
    this.MathJax = MathJax;
  }

  render(options) {

    this.MathJax.Hub.Config({
      tex2jax: {
        inlineMath: [['$','$'], ['\\(','\\)']]
      }
    });

    var nodes = this.container.childNodes;

    var refs = {};
    var section_tree = {};

    // labeled blocks nodes
    var block_number = 1;
    for (var i = 0; i < nodes.length; i++) {
      if (labeled_blocks_tag_types.includes(nodes[i].tagName)) {
        var id = nodes[i].id || nodes[i].tagName.toLowerCase() + '-' + block_number;
        var blockquote = document.createElement('blockquote');
        var strong = document.createElement('strong');
        var text = document.createElement('p');
        strong.appendChild(
          document.createTextNode(
            nodes[i].tagName.charAt(0).toUpperCase() + nodes[i].tagName.slice(1).toLowerCase() + " "
          )
        );
        var a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.appendChild(document.createTextNode(block_number));
        a.href = "#" + id;
        strong.appendChild(a);
        strong.appendChild(document.createTextNode('.'));
        if (nodes[i].title) {
          strong.innerHTML += ' ' + nodes[i].title + '.';
        }
        text.innerHTML = nodes[i].innerHTML;
        blockquote.appendChild(strong);
        blockquote.appendChild(text);
        blockquote.id = id;
        this.container.replaceChild(blockquote, nodes[i]);

        refs[id] = block_number;
        block_number++;
      }
    }

    // proofs
    var proof_number = 1;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "PROOF") {

        var proof = document.createElement('p');
        proof.innerHTML = nodes[i].innerHTML;
        proof.style.margin = "0px";
        var right = document.createElement('div');
        right.classList.add('text-right');
        right.appendChild(document.createTextNode('$\\blacksquare$'));
        proof.appendChild(right);

        if (nodes[i].getAttribute('collapse') == "true") {
          var open = nodes[i].getAttribute('open') == "true";
          var proof_panel = document.createElement('div'); proof_panel.classList.add('proof-panel'); proof_panel.setAttribute('id', 'proof-' + String(proof_number))
          var panel_heading = document.createElement('div'); panel_heading.classList.add('proof-heading');
          var panel_body = document.createElement('div'); panel_body.classList.add('proof-body');
          var em = document.createElement('em'); em.appendChild(document.createTextNode('Proof.'))
          var span = document.createElement('span'); span.classList.add('proof-toggle');
          const pn = proof_number;
          span.onclick = function(e) {
            let proof_panel = document.getElementById('proof-' + pn);
            if (proof_panel.classList.contains('proof-closed')){
              proof_panel.classList.remove('proof-closed');
              this.innerHTML = "▲";
            } else {
              proof_panel.classList.add('proof-closed');
              this.innerHTML = "▼";
            }
          }

          proof_panel.appendChild(panel_heading);
            panel_heading.appendChild(em);
            panel_heading.appendChild(span);
          proof_panel.appendChild(panel_body);

          panel_body.appendChild(proof);


          this.container.replaceChild(proof_panel, nodes[i]);

          if (open) {
            span.innerHTML = "▲";
          } else {
            span.innerHTML = "▼";
            proof_panel.classList.add('proof-closed');
          }

        } else {
          var div = document.createElement('div');
          var em = document.createElement('em');
          em.appendChild(document.createTextNode('Proof.'));
          div.appendChild(em);
          div.appendChild(proof);
          this.container.replaceChild(div, nodes[i]);
        }
        proof_number++;
      }
    }

    // tables
    var table_number = 1;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "TABLE") {
        var id = nodes[i].id || 'table-' + table_number;
        var caption_text = nodes[i].getAttribute('caption');
        nodes[i].classList.add('table');
        nodes[i].id = undefined;
        var table_container = document.createElement('div');
        table_container.classList.add('table-container');
        table_container.appendChild(nodes[i].cloneNode(true));
        if (caption_text) {
          var caption = document.createElement('p');
          caption.classList.add('text-center');
          var a = document.createElement('a');
          if (options.highlight_links) {
            a.classList.add('highlight');
          }
          a.appendChild(document.createTextNode(table_number));
          a.href = "#" + id;
          caption.appendChild(document.createTextNode('Table '));
          caption.appendChild(a);
          caption.appendChild(document.createTextNode(': ' + caption_text));
          table_container.appendChild(caption);
        }
        table_container.id = id;
        this.container.replaceChild(table_container, nodes[i]);
        refs[id] = table_number;
        table_number++;
      }
    }


    // sections and subsections
    var section_number = 0;
    var subsection_number = 0;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "SECTION") {
        section_number++;
        var text = nodes[i].innerHTML;
        var id = nodes[i].id || "section-" + section_number;
        var h3 = document.createElement('h3');
        h3.classList.add('section');
        h3.id = id;
        var a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.appendChild(document.createTextNode(section_number));
        a.href = "#" + id;
        h3.appendChild(a);
        h3.innerHTML += " " + text;
        this.container.replaceChild(h3, nodes[i]);
        subsection_number = 0;
        refs[id] = section_number;
        section_tree[section_number] = {
          text: text,
          id: id,
          subsections: {}
        };
      } else if (nodes[i].tagName == "SUBSECTION") {
        subsection_number++;
        var text = nodes[i].innerHTML;
        var id = nodes[i].id || "subsection-" + section_number + "." + section_number;
        var h4 = document.createElement('h4');
        h4.classList.add('subsection');
        h4.id = id;
        var a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.appendChild(document.createTextNode(section_number + "." + section_number));
        a.href = "#" + id;
        h3.appendChild(a);
        h4.innerHTML += "  " + text;
        this.container.replaceChild(h4, nodes[i]);
        refs[id] = section_number + "." + subsection_number;
        section_tree[section_number].subsections[subsection_number] = {
          text: text,
          id: id
        };
      }
    }


    // build refs
    // recursive search
    var stack = [this.container];
    while (stack.length > 0) {
      var node = stack.pop();
      if (node.tagName == "REF") {
        var a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        var to = node.getAttribute('to');
        a.href = "#" + to;
        a.innerHTML = refs[to];
        node.appendChild(a);
      } else if (node.childNodes && node.childNodes.length != 0) {
        for (var i = 0; i < node.childNodes.length; i++) {
          stack.push(node.childNodes[i]);
        }
      }
    }




    // build table of contents
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "TABLEOFCONTENTS") {
        var div = document.createElement('div');
        div.classList.add('HTMLTeX-toc')
        var heading = document.createElement('h3');
        heading.appendChild(document.createTextNode('Contents'));
        div.appendChild(heading);
        var ol = document.createElement('ol');
        for (var s in section_tree) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          if (options.highlight_links) {
            a.classList.add('highlight');
          }
          a.innerHTML = section_tree[s].text;
          a.href = "#" + section_tree[s].id;
          li.appendChild(a);
          if (section_tree[s].subsections[1]) {
            var sub_ol = document.createElement('ol');
            for (var sub in section_tree[s].subsections) {
              var sub_li = document.createElement('li');
              var a = document.createElement('a');
              if (options.highlight_links) {
                a.classList.add('highlight');
              }
              a.innerHTML = section_tree[s].subsections[sub].text;
              a.href = "#" + section_tree[s].subsections[sub].id;
              sub_li.appendChild(a);
              sub_ol.appendChild(sub_li);
            }
            li.appendChild(sub_ol);
          }
          ol.appendChild(li);
          div.appendChild(ol);
        }
        this.container.replaceChild(div, nodes[i]);
      }
    }



    // build references (citations)
    var cites = {};
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "REFERENCES") {
        var items = nodes[i].childNodes;
        var div = document.createElement('div');
        var h3 = document.createElement('h3');
        h3.appendChild(document.createTextNode('References'));
        div.appendChild(h3);
        var ol = document.createElement('ol');
        var cite_num = 1;
        for (var j = 0; j < items.length; j++) {
          if (items[j].tagName == "ITEM") {
            var id = items[j].getAttribute('id') || 'cite-' + cite_num;
            cites[id] = cite_num;
            var li = document.createElement('li');
            li.innerHTML = items[j].innerHTML;
            li.setAttribute('id', id);
            ol.appendChild(li);
            cite_num++;
          }
        }
        div.appendChild(ol);
        this.container.replaceChild(div, nodes[i]);
      }
    }




    // build cites
    // recursive search
    var stack = [this.container];
    while (stack.length > 0) {
      var node = stack.pop();
      if (node.tagName == "CITE") {
        var a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        var to = node.getAttribute('to');
        a.href = "#" + to;
        a.innerHTML = '[' + cites[to] + ']';
        node.appendChild(a);
      } else if (node.childNodes && node.childNodes.length != 0) {
        for (var i = 0; i < node.childNodes.length; i++) {
          stack.push(node.childNodes[i]);
        }
      }
    }



    // apply style
    this.container.classList.add('HTMLTeX');

    // typeset
    this.MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

  }


}
