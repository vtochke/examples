package events

import (
	"fmt"
	"log"
	"main/event_async"
)

type SomethingEvent struct {
}

func (event SomethingEvent) Handle(msgs []event_async.Message) {
	for _, m := range msgs {
		output := "Message data (key/value) - "

		for key, value := range m.Data {
			output += fmt.Sprintf("%s:%v / ", key, value)
		}

		log.Println(output)
	}
}
