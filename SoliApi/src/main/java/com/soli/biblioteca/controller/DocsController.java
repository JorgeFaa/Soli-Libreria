package com.soli.biblioteca.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DocsController {

    // Redirigir /docs y /docs/ al archivo estático /docs/index.html
    @GetMapping({"/docs", "/docs/"})
    public String docsIndex() {
        return "forward:/docs/index.html";
    }
}