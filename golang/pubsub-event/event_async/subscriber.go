package event_async

func NewSubscriber(h Handler, b int, r string) *Subscriber {
	sub := &Subscriber{
		Handler: h,
		Batch:   b,
	}

	return sub
}

type Subscriber struct {
	Items []Message
	Handler
	Batch int
}

type Handler interface {
	Handle([]Message)
}

func (s *Subscriber) Notify(m Message) {
	s.Items = append(s.Items, m)

	if len(s.Items) >= s.Batch {
		s.Handler.Handle(s.Items)
		s.Items = []Message{} // clean stack
	}
}
