/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.ConcurrentLinkedQueue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.util.ConcurrentReferenceHashMap;

/**
 *
 * @author 2105409
 */
@Controller
public class STOMPMessagesHandler {
	
	@Autowired
	SimpMessagingTemplate msgt;
        
        private ConcurrentHashMap<Integer,ConcurrentLinkedQueue<Point>> points = new ConcurrentHashMap<>();
    
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
            int num = Integer.parseInt(numdibujo);
            if(points.containsKey(num)){
                points.get(num).add(pt);
                msgt.convertAndSend("/topic/newpoint."+num, pt);
                if(points.get(num).size()>=4){
                    msgt.convertAndSend("/topic/newpolygon."+num,points.get(num));
                }
            }else{
                ConcurrentLinkedQueue<Point> tmp = new ConcurrentLinkedQueue<>();
                tmp.add(pt);
                points.put(num, tmp);
            }            
	}
}