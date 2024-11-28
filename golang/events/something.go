package events

import (
	"log"
	"main/pkg/event_async"
)

type SomethingEvent struct {
}

func (event SomethingEvent) Handle(msgs []event_async.Message) {
	log.Println(msgs)
	for _, m := range msgs {
		log.Println(m.Data)
	}

}
