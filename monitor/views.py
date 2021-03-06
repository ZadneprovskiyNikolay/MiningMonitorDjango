from . import device_utils
from .models import Device
from .services import get_work_archive, calc_payback
from .utils import converter_json, ownership_required, has_power_cost, \
    get_transactions

from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template import loader
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.forms.models import model_to_dict
from django.core import serializers

import logging
import os
import json
import sys
import json
from collections import Iterable
from functools import wraps

logger = logging.getLogger(__name__)

@login_required
@require_http_methods(['GET'])
def index(request):    
    return render(request, 'base.html')

@login_required
@require_http_methods(['GET'])
def add_device(request):    
    return render(request, 'add_device.html')   

@login_required
@require_http_methods(['GET'])
def my_devices(request): 
    return render(request, 'my_devices.html')
    
@login_required
@require_http_methods(['GET'])
def add_transaction_view(request):
    return render(request, 'add_transaction.html')                    

@login_required
@require_http_methods(['GET'])
def maintenance(request):           
    return render(request, 'maintenance.html')
   
@ownership_required(['POST'])
@require_http_methods(['GET', 'POST'])
@login_required
def manage_devices(request):           
    if request.method == 'GET': 
        return render(request, 'manage_devices.html')
    elif request.method == 'POST': 
        settings = json.loads(request.body)           
        if device_utils.manage_devices(request.user, settings):            
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False})

@login_required
@require_http_methods(['GET'])
def work_archive(request):           
    return render(request, 'work_archive.html')

@login_required
@require_http_methods(['GET'])
@ownership_required()
def work_archive_json(request, device_id):           
    device_id = int(device_id) 
    work_archive = get_work_archive(device_id)
    work_archive_json = json.dumps(work_archive, default=converter_json)
    return HttpResponse(work_archive_json, content_type='application/json')    

@login_required
@require_http_methods(['GET'])
def archive_devices(request): 
    return render(request, 'archive_devices.html')

@login_required
@require_http_methods(['GET'])
def payback(request): 
    power_cost_specified = has_power_cost(request.user.id)         
    return render(request, 'payback.html', {'power_cost_specified': power_cost_specified})

@login_required
@require_http_methods(['GET'])
def payback_json(request, device_id): 
    device_id = int(device_id) 

    total_payback = calc_payback(request.user.id)    
    if not total_payback:
        return  HttpResponse({}, content_type='application/json')
    payback = total_payback.get(device_id)        
    payback_json = json.dumps(payback, default=converter_json)
    return HttpResponse(payback_json, content_type='application/json')

@login_required
@require_http_methods(['GET'])
def transactions(request): 
    return render(request, 'transactions.html')
