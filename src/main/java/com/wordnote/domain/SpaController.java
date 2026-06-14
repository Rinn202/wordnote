package com.wordnote.domain;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    @RequestMapping(value = {"/", "/{path:[^\\.]*}", "/login/redirect"})
    public String index() {
        return "forward:/index.html";
    }
} //api 미아 -> api/index.html로