package com.miros.ArbiterReact.Controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin("*")
public class HomeController {

    @RequestMapping(value = "/")
    public String index() {
        return "index";
    }

}