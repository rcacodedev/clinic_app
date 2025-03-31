from django.urls import path
from .views import NoteListCreateView, NoteDetailView, NotesByDateView, TodayNotesView

urlpatterns = [
    path('', NoteListCreateView.as_view(), name='note-list-create'),
    path('<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('date/<str:date>/', NotesByDateView.as_view(), name='notes-by-date'),
    path('today/', TodayNotesView.as_view(), name='today-notes'),
]
