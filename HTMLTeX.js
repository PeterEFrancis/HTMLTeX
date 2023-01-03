
"use strict";


const labeled_blocks_tag_types = [
  'THEOREM',
  'LEMMA',
  'PROPOSITION',
  'COROLLARY',
  'DEFINITION'
];

const unlabeled_blocks_tag_types = [
  'REMARK',
  'EXAMPLE'
];



class HTMLTeX {

  constructor(container, MathJax) {
    this.container = container;
    this.MathJax = MathJax;
  }

  render(options) {

    for (let symb of [",", ".", ";", ":", "?", "!"]) {
      this.container.innerHTML = this.container.innerHTML
        .replaceAll('$$' + symb, symb + '$$$$')
        .replaceAll('$' + symb, symb + '$$');
    }

    // while (this.container.innerHTML.includes('\n\n\n')) {
    //   this.container.innerHTML = this.container.innerHTML.replaceAll('\n\n', '\n');
    // }
    this.container.innerHTML = this.container.innerHTML.replaceAll('\n\n', '<br>');




    this.MathJax.Hub.Config({
      tex2jax: {
        inlineMath: [['$','$'], ['\\(','\\)']]
      }
    });



    let nodes = this.container.childNodes;

    let refs = {};
    let section_tree = {};

    // abstract
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "ABSTRACT") {
        let abstract = document.createElement('div');
        abstract.classList.add('abstract');
        let strong = document.createElement('strong');
        strong.innerHTML = 'Abstract. ';
        abstract.appendChild(strong);
        abstract.innerHTML += nodes[i].innerHTML;
        this.container.replaceChild(abstract, nodes[i]);
      }
    }


    // labeled blocks nodes
    let block_number = 1;
    for (let i = 0; i < nodes.length; i++) {
      if (labeled_blocks_tag_types.includes(nodes[i].tagName)) {
        let id = nodes[i].id || nodes[i].tagName.toLowerCase() + '-' + block_number;
        let blockquote = document.createElement('blockquote');
        let strong = document.createElement('strong');
        let text = document.createElement('p');
        strong.appendChild(
          document.createTextNode(
            nodes[i].tagName.charAt(0).toUpperCase() + nodes[i].tagName.slice(1).toLowerCase() + " "
          )
        );
        let a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.appendChild(document.createTextNode(block_number));
        a.href = "#" + id;
        strong.appendChild(a);
        // strong.appendChild(document.createTextNode('.'));
        if (nodes[i].title) {
          strong.innerHTML += ' ' + nodes[i].title + '.';
        } else {
          strong.innerHTML += "."
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

    // unlabled blocks
    let unlabeled_block_number = 1;
    for (let i = 0; i < nodes.length; i++) {
      if (unlabeled_blocks_tag_types.includes(nodes[i].tagName)) {
        let id = nodes[i].id || nodes[i].tagName.toLowerCase() + '-' + unlabeled_block_number;
        let block = document.createElement('div');
        let strong = document.createElement('strong');
        let a = document.createElement('a');

        block.appendChild(strong);
        strong.appendChild(a);
        a.appendChild(
          document.createTextNode(
            nodes[i].tagName.charAt(0).toUpperCase() + nodes[i].tagName.slice(1).toLowerCase()
          )
        );
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.href = "#" + id;
        // strong.appendChild(document.createTextNode('. '));
        if (nodes[i].title) {
          strong.innerHTML += ' ' + nodes[i].title + '. ';
        } else {
          strong.innerHTML += ".";
        }
        block.appendChild(document.createTextNode(nodes[i].innerHTML));

        block.id = id;
        this.container.replaceChild(block, nodes[i]);

        refs[id] = block_number;
        block_number++;
      }
    }

    //example modals
    let example_modal_num = 1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName === "EXAMPLE-MODAL") {
        let id = nodes[i].id || nodes[i].tagName.toLowerCase() + '-' + example_modal_num;

        let button = document.createElement('button');
        button.classList.add('btn');
        button.setAttribute('type', 'button');
        button.setAttribute('data-toggle', "modal");
        button.setAttribute('data-target', "#" + "example-modal-popup-" + id);
        button.innerHTML = "Example";

        let popup = document.createElement('div');
        popup.classList.add('modal', 'fade', 'text-left');
        popup.setAttribute('id', "example-modal-popup-" + id);
        popup.setAttribute('role', "dialog");
        let dialog = document.createElement('div');
        dialog.classList.add('modal-dialog');
        let content = document.createElement('div');
        content.classList.add('modal-content');
        let header = document.createElement('div');
        header.classList.add('modal-header');
        let close = document.createElement('button');
        close.classList.add('close');
        close.setAttribute('type', 'button');
        close.setAttribute('data-dismiss', "modal");
        close.innerHTML = "&times;";
        let header_text = document.createElement('h4');
        header_text.classList.add('modal-title');
        header_text.innerHTML = "Example";
        if (nodes[i].title) {
          header_text.innerHTML += ' ' + nodes[i].title + '.';
        } else {
          header_text += "."
        }
        let body = document.createElement('div');
        body.classList.add('modal-body');
        let p = document.createElement('p');
        p.innerHTML = nodes[i].innerHTML;

        let block = document.createElement('div');
        block.appendChild(button);
        block.appendChild(popup);
        popup.appendChild(dialog);
        dialog.appendChild(content);
        content.appendChild(header);
        header.appendChild(close);
        header.appendChild(header_text);
        content.appendChild(body);
        body.appendChild(p);

        if (nodes[i].getAttribute('outside') === "true") {
          block.classList.add('text-right', 'example-modal-container');
          button.classList.add('btn', 'example-modal-btn');
        }

        this.container.replaceChild(block, nodes[i]);

        refs[id] = block_number;
        block_number++;
      }
    }

    // proofs
    let proof_number = 1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "PROOF") {

        let proof = document.createElement('p');
        proof.innerHTML = nodes[i].innerHTML;
        proof.style.margin = "0px";
        let right = document.createElement('div');
        right.classList.add('text-right');
        right.appendChild(document.createTextNode('$\\blacksquare$'));
        proof.appendChild(right);

        if (nodes[i].getAttribute('collapse') == "true") {
          let open = nodes[i].getAttribute('open') == "true";
          let proof_panel = document.createElement('div'); proof_panel.classList.add('proof-panel'); proof_panel.setAttribute('id', 'proof-' + String(proof_number))
          let panel_heading = document.createElement('div'); panel_heading.classList.add('proof-heading');
          let panel_body = document.createElement('div'); panel_body.classList.add('proof-body');
          let em = document.createElement('em'); em.appendChild(document.createTextNode('Proof.'))
          let span = document.createElement('span'); span.classList.add('proof-toggle');
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
          let div = document.createElement('div');
          let em = document.createElement('em');
          em.appendChild(document.createTextNode('Proof.'));
          div.appendChild(em);
          div.appendChild(proof);
          this.container.replaceChild(div, nodes[i]);
        }
        proof_number++;
      }
    }

    // tables
    let table_number = 1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "TABLE") {
        let id = nodes[i].id || 'table-' + table_number;
        let caption_text = nodes[i].getAttribute('caption');
        nodes[i].classList.add('table');
        nodes[i].id = undefined;
        let table_container = document.createElement('div');
        table_container.classList.add('table-container');
        table_container.appendChild(nodes[i].cloneNode(true));
        if (caption_text) {
          let caption = document.createElement('p');
          caption.classList.add('text-center');
          let a = document.createElement('a');
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
    let section_number = 0;
    let subsection_number = 0;
    let subsubsection_number = 0;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "SECTION") {
        section_number++;
        let text = nodes[i].innerHTML;
        let id = nodes[i].id || "section-" + section_number;
        let h3 = document.createElement('h3');
        h3.classList.add('section');
        h3.id = id;
        let a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.appendChild(document.createTextNode(section_number));
        a.href = "#" + id;
        h3.appendChild(a);
        h3.innerHTML += " " + text;
        this.container.replaceChild(h3, nodes[i]);
        subsection_number = 0;
        subsubsection_number = 0;
        refs[id] = section_number;
        section_tree[section_number] = {
          text: text,
          id: id,
          subsections: {}
        };
      } else if (nodes[i].tagName == "SUBSECTION") {
        subsection_number++;
        let text = nodes[i].innerHTML;
        let id = nodes[i].id || "subsection-" + section_number + "." + subsection_number;
        let h4 = document.createElement('h4');
        h4.classList.add('subsection');
        h4.id = id;
        let a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.appendChild(document.createTextNode(section_number + "." + subsection_number));
        a.href = "#" + id;
        h4.appendChild(a);
        h4.innerHTML += "  " + text;
        this.container.replaceChild(h4, nodes[i]);
        subsubsection_number = 0;
        refs[id] = section_number + "." + subsection_number;
        section_tree[section_number].subsections[subsection_number] = {
          text: text,
          id: id
        };
      } else if (nodes[i].tagName == "SUBSUBSECTION") {
        subsubsection_number++;
        let text = nodes[i].innerHTML;
        let id_num = section_number + "." + subsection_number + "." + subsubsection_number;
        let id = nodes[i].id || "subsubsection-" + id_num;
        let h5 = document.createElement('h5');
        h5.classList.add('subsubsection');
        h5.id = id;
        let a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        a.appendChild(document.createTextNode(id_num));
        a.href = "#" + id;
        h5.appendChild(a);
        h5.innerHTML += "  " + text;
        this.container.replaceChild(h5, nodes[i]);
        refs[id] = id_num;
      }
    }


    // build refs
    // recursive search
    let r_stack = [this.container];
    while (r_stack.length > 0) {
      let node = r_stack.pop();
      if (node.tagName == "REF") {
        let a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        let to = node.getAttribute('to');
        a.href = "#" + to;
        a.innerHTML = refs[to];
        node.appendChild(a);
      } else if (node.childNodes && node.childNodes.length != 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          r_stack.push(node.childNodes[i]);
        }
      }
    }




    // build table of contents
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "TABLEOFCONTENTS") {
        let div = document.createElement('div');
        div.classList.add('HTMLTeX-toc')
        let heading = document.createElement('h3');
        heading.appendChild(document.createTextNode('Contents'));
        div.appendChild(heading);
        let ol = document.createElement('ol');
        for (let s in section_tree) {
          let li = document.createElement('li');
          let a = document.createElement('a');
          if (options.highlight_links) {
            a.classList.add('highlight');
          }
          a.innerHTML = section_tree[s].text;
          a.href = "#" + section_tree[s].id;
          li.appendChild(a);
          if (section_tree[s].subsections[1]) {
            let sub_ol = document.createElement('ol');
            for (let sub in section_tree[s].subsections) {
              let sub_li = document.createElement('li');
              let a = document.createElement('a');
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
    let cites = {};
    let ref_num = 1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].tagName == "REFERENCES") {
        let items = nodes[i].childNodes;
        let div = document.createElement('div');
        let a = document.createElement('a');
        a.href = "#references" + (ref_num > 1 ? '-' + ref_num : '');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        let h3 = document.createElement('h3');
        h3.setAttribute('id', "references" + (ref_num > 1 ? '-' + ref_num : ''));
        ref_num++;
        a.appendChild(document.createTextNode('References'));
        div.appendChild(h3);
        h3.appendChild(a);
        let ol = document.createElement('ol');
        ol.classList.add('references');
        let cite_num = 1;
        for (let j = 0; j < items.length; j++) {
          if (items[j].tagName == "ITEM") {
            let id = items[j].getAttribute('id') || 'cite-' + cite_num;
            cites[id] = cite_num;
            let li = document.createElement('li');
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
    let c_stack = [this.container];
    while (c_stack.length > 0) {
      let node = c_stack.pop();
      if (node.tagName == "CITE") {
        let a = document.createElement('a');
        if (options.highlight_links) {
          a.classList.add('highlight');
        }
        let to = node.getAttribute('to');
        a.href = "#" + to;
        a.innerHTML = '[' + cites[to] + ']';
        node.appendChild(a);
      } else if (node.childNodes && node.childNodes.length != 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          c_stack.push(node.childNodes[i]);
        }
      }
    }



    // apply style
    this.container.classList.add('HTMLTeX');

    // typeset
    this.MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

  }


}
